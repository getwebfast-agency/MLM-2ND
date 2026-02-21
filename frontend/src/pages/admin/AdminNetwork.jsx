import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MiniMap,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
// import { X } from 'lucide-react'; // Removed to prevent crashes

// Custom Node Component to match the reference image
const CustomNode = ({ data }) => {
    // Generate avatar URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random&color=fff&size=64`;

    return (
        <div className="flex flex-col items-center relative">
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400" />

            {/* Avatar Circle */}
            <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 z-10 relative">
                <img
                    src={avatarUrl}
                    alt={data.user.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Name Badge */}
            <div className="bg-[#0ea5e9] text-white text-xs font-semibold px-3 py-1 rounded-md min-w-[100px] max-w-[150px] truncate text-center shadow-sm -mt-3 pt-4 z-0 border border-white">
                {data.user.name}
                <div className="text-[9px] font-normal opacity-90 truncate max-w-[130px] mx-auto">
                    {data.user.email}
                </div>
                {/* Debug: Sponsor ID check */}
                <div className="text-[8px] text-gray-200 mt-0.5 truncate max-w-[130px] mx-auto opacity-70">
                    Sponsor: {data.user.sponsor_id || data.user.sponsorId ? (String(data.user.sponsor_id || data.user.sponsorId).substring(0, 8) + '...') : 'None'}
                </div>
            </div>
            {/* Role/Rank Badge (Optional, small below) */}
            <div className="text-[10px] text-gray-500 mt-1 font-medium bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                {data.user.role === 'admin' ? 'Admin' : 'Member'}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400" />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

// Removed global dagreGraph to prevent state issues across renders
// Layout settings
const nodeWidth = 120;
const nodeHeight = 120; // Increased to account for vertical stack

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    try {
        dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        nodes.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            if (nodeWithPosition) {
                node.targetPosition = 'top';
                node.sourcePosition = 'bottom';
                node.position = {
                    x: nodeWithPosition.x - nodeWidth / 2,
                    y: nodeWithPosition.y - nodeHeight / 2,
                };
            }
        });
    } catch (err) {
        console.error("Dagre Layout Error:", err);
    }

    return { nodes, edges };
};


const AdminNetwork = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null); // Fixed: Added missing state
    const [debugInfo, setDebugInfo] = useState(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                let res;
                let usedFallback = false;
                try {
                    res = await axios.get(`${API_URL}/admin/network`, config);
                } catch (err) {
                    console.warn('Primary network fetch failed, using fallback.');
                    usedFallback = true;
                }

                // DATA NORMALIZATION
                let rawUsers = [];
                if (!usedFallback && res && res.data) {
                    if (res.data.users && Array.isArray(res.data.users)) {
                        rawUsers = res.data.users;
                    } else if (res.data.tree && Array.isArray(res.data.tree)) {
                        rawUsers = res.data.tree;
                    } else if (Array.isArray(res.data)) {
                        rawUsers = res.data;
                    } else if (res.data.data && Array.isArray(res.data.data)) {
                        rawUsers = res.data.data;
                    }
                }

                // Aggressive Fallback: If primary returned nothing valid, try the getAllUsers endpoint
                if (rawUsers.length === 0) {
                    console.warn('Primary network data empty. Fetching full user list as fallback...');
                    try {
                        res = await axios.get(`${API_URL}/admin/users?limit=1000`, config);
                        if (res.data.users && Array.isArray(res.data.users)) {
                            rawUsers = res.data.users;
                        } else if (Array.isArray(res.data)) {
                            rawUsers = res.data;
                        }
                    } catch (fallbackErr) {
                        console.error('Fallback fetch failed:', fallbackErr);
                    }
                }

                setDebugInfo({
                    dataSource: usedFallback ? 'fallback' : 'primary',
                    userCount: rawUsers?.length
                });

                if (!rawUsers || rawUsers.length === 0) {
                    setNodes([]);
                    setEdges([]);
                    setLoading(false);
                    return;
                }

                // Create Nodes
                const newNodes = rawUsers.map((user, index) => ({
                    id: String(user.id).toLowerCase(), // Normalize ID
                    type: 'custom', // Use our new custom node type
                    data: {
                        user: user
                    },
                    // Initial Layout: Grid fallback if dagre fails
                    position: { x: (index % 4) * 200, y: Math.floor(index / 4) * 100 },
                }));

                // Create Edges
                const newEdges = [];
                rawUsers.forEach((user) => {
                    // Check for both sponsor_id (snake_case from DB) and sponsorId (camelCase from model/associations)
                    const rawSponsorId = user.sponsor_id || user.sponsorId;

                    if (rawSponsorId) {
                        const sId = String(rawSponsorId).toLowerCase(); // Normalize
                        const uId = String(user.id).toLowerCase(); // Normalize

                        // Prevent self-loops
                        if (sId === uId) return;

                        // Only add edge if sponsor exists in current set
                        if (newNodes.find(n => n.id === sId)) {
                            newEdges.push({
                                id: `e-${sId}-${uId}`,
                                source: sId,
                                target: uId,
                                type: 'step', // Orthogonal lines
                                animated: true,
                                style: { stroke: '#64748b', strokeWidth: 2 }
                            });
                        }
                    }
                });

                // Try Dagre Layout
                let finalNodes = newNodes;
                let finalEdges = newEdges;

                if (newEdges.length > 0) {
                    try {
                        const layout = getLayoutedElements(newNodes, newEdges);
                        finalNodes = layout.nodes;
                        finalEdges = layout.edges;
                    } catch (e) {
                        console.error("Layout failed, using grid fallback", e);
                        // Fallback
                    }
                } else {
                    console.warn("No edges found. Nodes will be displayed in grid layout.");
                }

                setNodes(finalNodes);
                setEdges(finalEdges);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching network:', error);
                setDebugInfo({ error: error.message });
                setLoading(false);
            }
        };

        fetchNetwork();
    }, [setNodes, setEdges]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredNodes, setFilteredNodes] = useState([]);

    // Filter nodes when search term changes
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredNodes(nodes);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const matches = nodes.filter(node =>
            node.data.user.name.toLowerCase().includes(lowerTerm) ||
            node.data.user.email.toLowerCase().includes(lowerTerm) ||
            (node.data.user.referral_code && node.data.user.referral_code.toLowerCase().includes(lowerTerm))
        );

        // Optionally highlight or just set filtered (here strictly filtering might break tree connections, 
        // effectively we might want to just HIGHLIGHT matches. 
        // But for "search option", jumping to node or filtering table is common. 
        // In a tree, filtering hides parents which breaks layout.
        // Let's implement Highlighting instead.

        // We will update node styles based on search
        setNodes(nds => nds.map(node => {
            const isMatch = node.data.user.name.toLowerCase().includes(lowerTerm) ||
                node.data.user.email.toLowerCase().includes(lowerTerm) ||
                (node.data.user.referral_code && node.data.user.referral_code.toLowerCase().includes(lowerTerm));

            return {
                ...node,
                style: isMatch ? { ...node.style, border: '3px solid #f59e0b', boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)' } : { ...node.style, border: 'none', boxShadow: 'none' },
                data: { ...node.data, isMatch } // Pass highlight state if needed
            };
        }));

        if (matches.length > 0) {
            // Center on first match?
            // This requires reactflow instance which we don't have easily here without hook.
            // But we can set selectedNode to first match to open sidebar
            setSelectedNode(matches[0]);
        }

    }, [searchTerm]); // Removed setNodes dependency to avoid loop

    if (loading) return <div className="p-10">Loading network tree...</div>;

    return (
        <div className="flex flex-col gap-4 h-full relative">
            {/* Search Bar */}
            <div className="absolute top-4 left-4 z-50 w-64">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search member..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="h-[calc(100vh-180px)] bg-gray-50 border rounded-lg shadow-sm w-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onNodeClick={(event, node) => setSelectedNode(node)}
                    fitView
                >
                    <Background color="#f8fafc" gap={16} />
                    <Controls />
                    <MiniMap />
                    <div className="absolute top-4 right-4 bg-white/90 p-2 rounded shadow text-xs z-50 pointer-events-none">
                        <div>Nodes: {nodes.length}</div>
                        <div>Edges: {edges.length}</div>
                        <div>First ID: {nodes[0]?.id?.substring(0, 8)}</div>
                        <div>Sample Sponsor: {nodes[1]?.data?.user?.sponsor_id?.substring(0, 8) || 'None'}</div>
                    </div>
                </ReactFlow>
            </div>

            {/* Member Detail Sidebar */}
            {selectedNode && (
                <div className="absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out z-50">
                    <button
                        onClick={() => setSelectedNode(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold p-1 rounded hover:bg-gray-100"
                    >
                        ✕
                    </button>

                    <div className="flex flex-col items-center mb-6 mt-2">
                        <div className="w-20 h-20 rounded-full border-4 border-indigo-100 overflow-hidden mb-3 bg-gray-50">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedNode.data.user.name)}&background=random&color=fff&size=128`}
                                alt={selectedNode.data.user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 text-center">{selectedNode.data.user.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${selectedNode.data.user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {selectedNode.data.user.role === 'admin' ? 'Administrator' : 'Member'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email / Contact</label>
                            <div className="text-sm font-medium text-gray-900 break-words">{selectedNode.data.user.email}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Referral Code</label>
                            <div className="flex items-center justify-between">
                                <code className="bg-white border px-2 py-1 rounded text-sm text-gray-700 font-mono">
                                    {selectedNode.data.user.referral_code || 'N/A'}
                                </code>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Sponsor ID</label>
                            <div className="text-xs text-gray-600 font-mono break-all bg-white border p-1 rounded">
                                {selectedNode.data.user.sponsor_id || selectedNode.data.user.sponsorId || 'Root / None'}
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Joined Date</label>
                            <div className="text-sm text-gray-900">
                                {selectedNode.data.user.createdAt ? new Date(selectedNode.data.user.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>

                        {/* Stats Placeholder */}
                        <div className="pt-4 border-t border-gray-100 mt-2">
                            <h4 className="font-semibold text-gray-700 mb-3 text-sm">Network Stats</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100">
                                    <div className="text-xs text-blue-600 font-semibold uppercase mb-1">Depth</div>
                                    <div className="text-xl font-bold text-blue-900">{selectedNode.data.user.depth || 0}</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                                    <div className="text-xs text-green-600 font-semibold uppercase mb-1">Team</div>
                                    <div className="text-xl font-bold text-green-900">{selectedNode.data.user.teamCount || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Debug Panel removed */}
        </div>
    );
};

export default AdminNetwork;
