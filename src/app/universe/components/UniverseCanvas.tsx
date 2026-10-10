"use client";

import { useCallback, useEffect, useState, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Node,
    Edge,
    Connection,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useUniverseStore } from '@/store/useUniverseStore';
import { PlanetNode } from './PlanetNode';
import { SidePanel } from './SidePanel';
import { useRouter, useParams } from 'next/navigation';

const nodeTypes = {
    planet: PlanetNode,
};

function FlowEngine({ initialWorlds }: { initialWorlds: any[] }) {
    const { fitView, setCenter, getZoom } = useReactFlow();
    const router = useRouter();
    const params = useParams();
    
    // Local state for React Flow to ensure smooth dragging
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    
    // Global UI state
    const { 
        setActiveNode, 
        activeNodeId, 
        breadcrumbs, 
        pushBreadcrumb,
        setLoading
    } = useUniverseStore();

    // The currently selected node data for the SidePanel
    const selectedNode = useMemo(() => nodes.find(n => n.id === activeNodeId) || null, [nodes, activeNodeId]);

    // Initial Layout Generation (Radial/Hierarchical mock)
    useEffect(() => {
        // If we are at the root, show the initial worlds
        const generatedNodes: Node[] = initialWorlds.map((world, i) => {
            // Simple radial positioning around a central point (0,0)
            const angle = (i / initialWorlds.length) * 2 * Math.PI;
            const radius = 300;
            return {
                id: world.id,
                type: 'planet',
                position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
                data: {
                    name: world.name,
                    emoji: world.emoji,
                    isHidden: world.isHidden,
                    progress: world.progress,
                    color: i === 0 ? '#7C4DFF' : i === 1 ? '#4CAF50' : '#F7C948'
                }
            };
        });

        // Add a central "Universe Core" node just for visual flair
        generatedNodes.push({
            id: 'core',
            type: 'planet',
            position: { x: 0, y: 0 },
            data: {
                name: 'The Source',
                emoji: '🌌',
                isHidden: false,
                progress: 100,
                state: 'mastered',
                color: '#ffffff'
            }
        });

        // Connect everything to the core
        const generatedEdges: Edge[] = initialWorlds.map((world) => ({
            id: `e-core-${world.id}`,
            source: 'core',
            target: world.id,
            animated: true,
            style: { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }
        }));

        setNodes(generatedNodes);
        setEdges(generatedEdges);
        
        // Wait a tick for React Flow to mount nodes, then fit view
        setTimeout(() => fitView({ padding: 0.5, duration: 1500 }), 100);
    }, [initialWorlds, setNodes, setEdges, fitView]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        // Fly camera to node
        setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 800 });
        
        // Open SidePanel
        setActiveNode(node.id);
    }, [setCenter, setActiveNode]);

    const onExplore = useCallback(async (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Close panel and show loading
        setActiveNode(null);
        setLoading(true);

        // Update Breadcrumbs & URL
        const newSlug = node.data.name.toString().toLowerCase().replace(/\s+/g, '-');
        
        // Build URL from existing breadcrumbs to prevent duplicates
        const currentPathSlugs = breadcrumbs.map(b => b.slug).filter(s => s !== 'universe');
        if (currentPathSlugs[currentPathSlugs.length - 1] !== newSlug) {
            currentPathSlugs.push(newSlug);
        }
        
        const newPath = currentPathSlugs.join('/');
        pushBreadcrumb({ id: node.id, label: node.data.name as string, slug: newSlug });
        router.push(`/universe/${newPath}`);

        // ACTUAL LAZY LOADING CHILDREN
        try {
            const res = await fetch(`/api/universe?parentSlug=${newSlug}`);
            const data = await res.json();
            
            if (data.nodes && data.nodes.length > 0) {
                const childNodes: Node[] = [];
                const childEdges: Edge[] = [];
                
                const numChildren = data.nodes.length;
                data.nodes.forEach((childData: any, i: number) => {
                    const childId = childData.id;
                    const angle = (i / numChildren) * 2 * Math.PI;
                    const distance = 400; // Further out
                    
                    childNodes.push({
                        id: childId,
                        type: 'planet',
                        position: { 
                            x: node.position.x + Math.cos(angle) * distance, 
                            y: node.position.y + Math.sin(angle) * distance 
                        },
                        data: {
                            name: childData.name,
                            emoji: childData.emoji || '🪐',
                            progress: childData.progress || 0,
                            state: 'new'
                        }
                    });

                    childEdges.push({
                        id: `e-${nodeId}-${childId}`,
                        source: nodeId,
                        target: childId,
                        animated: true,
                        style: { stroke: 'rgba(124,77,255,0.5)', strokeWidth: 3 }
                    });
                });

                // Update node visual state
                setNodes((nds) => 
                    nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, state: 'mastered' } } : n)
                    .concat(childNodes)
                );
                setEdges((eds) => eds.concat(childEdges));
                
                // Fly camera to encompass new cluster
                setTimeout(() => {
                    fitView({ nodes: [{ id: nodeId }, ...childNodes], padding: 0.3, duration: 1200 });
                }, 100);
            }
        } catch (err) {
            console.error("Failed to load children:", err);
        } finally {
            setLoading(false);
        }

    }, [nodes, setActiveNode, pushBreadcrumb, params.path, router, setNodes, setEdges, fitView, setLoading]);

    const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={() => setActiveNode(null)}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={4}
                proOptions={{ hideAttribution: true }}
                className="bg-transparent"
            >
            </ReactFlow>

            <SidePanel 
                node={selectedNode} 
                onClose={() => setActiveNode(null)} 
                onExplore={onExplore}
            />
        </>
    );
}

// Wrap in ReactFlowProvider so we can use the hook `useReactFlow` for camera controls
export function UniverseCanvas({ initialWorlds }: { initialWorlds: any[] }) {
    return (
        <div className="absolute inset-0 z-10 w-full h-full">
            <ReactFlowProvider>
                <FlowEngine initialWorlds={initialWorlds} />
            </ReactFlowProvider>
        </div>
    );
}
