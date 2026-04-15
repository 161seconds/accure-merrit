import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import * as THREE from "three";

// ─── CONSTANTS ───
const CLUSTER_THRESHOLD = 10;
const TRUNK_COLOR = "#2A1A0A";
const BRANCH_COLOR = "#3D2512";

// Tone màu mới: Xanh lá mạ, Xanh ngọc và Vàng óng
const LEAF_COLORS = ["#73C92D", "#8EDE35", "#FFD700", "#FACC15", "#4ADE80"];
const CLUSTER_COLORS = ["#FDE047", "#FEF08A", "#86EFAC", "#4ADE80", "#FBBF24"];

const GLOW_INTENSITY = 2.5;
const FOG_COLOR = "#050a06"; // Đổi nhẹ sang tone rêu tối cho hợp màu lá
const AMBIENT_COLOR = "#1a1505"; // Tone ấm nhẹ

// ─── SEEDED RANDOM ───
function seededRandom(seed: number) {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 213647;
        return (s - 1) / 213647;
    };
}

// ─── TREE GEOMETRY GENERATION ───
interface BranchData {
    start: THREE.Vector3;
    end: THREE.Vector3;
    radius: number;
    depth: number;
    id: number;
}

function generateTreeBranches(): BranchData[] {
    const branches: BranchData[] = [];
    let id = 0;
    const rand = seededRandom(42);

    function addBranch(
        start: THREE.Vector3,
        direction: THREE.Vector3,
        length: number,
        radius: number,
        depth: number
    ) {
        if (depth > 5 || radius < 0.02) return;

        const end = start
            .clone()
            .add(direction.clone().multiplyScalar(length));
        branches.push({ start: start.clone(), end: end.clone(), radius, depth, id: id++ });

        const numChildren = depth < 2 ? 3 + Math.floor(rand() * 2) : 2 + Math.floor(rand() * 2);

        for (let i = 0; i < numChildren; i++) {
            const spreadAngle = 0.3 + rand() * 0.6;
            const rotAngle = ((Math.PI * 2) / numChildren) * i + (rand() - 0.5) * 1.2;

            const newDir = direction.clone();
            const axis1 = new THREE.Vector3(Math.cos(rotAngle), 0, Math.sin(rotAngle)).normalize();
            newDir.applyAxisAngle(axis1, spreadAngle);

            if (depth < 2) {
                newDir.y = Math.max(newDir.y, 0.15);
            }

            const newLength = length * (0.55 + rand() * 0.25);
            const newRadius = radius * (0.5 + rand() * 0.2);

            addBranch(end.clone(), newDir.normalize(), newLength, newRadius, depth + 1);
        }
    }

    const trunkTop = new THREE.Vector3(0.15, 3.5, -0.1);
    branches.push({
        start: new THREE.Vector3(0, -1, 0),
        end: trunkTop.clone(),
        radius: 0.65,
        depth: 0,
        id: id++,
    });

    const mainDirs = [
        new THREE.Vector3(-0.7, 0.6, 0.3),
        new THREE.Vector3(0.8, 0.5, -0.2),
        new THREE.Vector3(-0.3, 0.7, -0.6),
        new THREE.Vector3(0.4, 0.55, 0.7),
        new THREE.Vector3(-0.5, 0.8, 0.1),
        new THREE.Vector3(0.6, 0.45, -0.5),
    ];

    mainDirs.forEach((dir) => {
        addBranch(trunkTop.clone(), dir.normalize(), 2.2 + rand() * 1.2, 0.28 + rand() * 0.12, 1);
    });

    return branches;
}

function getLeafPositions(branches: BranchData[]): THREE.Vector3[] {
    return branches
        .filter((b) => b.depth >= 3)
        .map((b) => b.end.clone());
}

function getClusterPositions(branches: BranchData[]): { position: THREE.Vector3; direction: THREE.Vector3 }[] {
    return branches
        .filter((b) => b.depth >= 2 && b.depth <= 3)
        .map((b) => ({
            position: b.end.clone(),
            direction: b.end.clone().sub(b.start).normalize(),
        }));
}

// ─── CANVAS RENDERER ───
export function KarmaTreeCanvas({
    totalPoints,
    onAddPoint,
}: {
    totalPoints: number;
    onAddPoint: () => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        leafInstances: THREE.InstancedMesh | null;
        clusterGroups: THREE.Group[];
        animationId: number;
        isDragging: boolean;
        prevMouse: { x: number; y: number };
        cameraAngle: { theta: number; phi: number; radius: number };
        targetAngle: { theta: number; phi: number; radius: number };
        clock: THREE.Clock;
        branches: BranchData[];
        leafPositions: THREE.Vector3[];
        clusterPositions: { position: THREE.Vector3; direction: THREE.Vector3 }[];
        prevPoints: number;
        leafOpacities: number[];
    } | null>(null);

    const branches = useMemo(() => generateTreeBranches(), []);
    const leafPositions = useMemo(() => getLeafPositions(branches), [branches]);
    const clusterPositions = useMemo(() => getClusterPositions(branches), [branches]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(FOG_COLOR);
        scene.fog = new THREE.FogExp2(FOG_COLOR, 0.04);

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
        camera.position.set(8, 5, 8);
        camera.lookAt(0, 3, 0);

        const renderer = new THREE.WebGLRenderer({
            antialias: true, // ĐỔI CÁI NÀY THÀNH false
            alpha: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(AMBIENT_COLOR, 0.8);
        scene.add(ambient);

        const mainLight = new THREE.DirectionalLight("#331111", 0.6);
        mainLight.position.set(5, 10, 5);
        scene.add(mainLight);

        // Ánh sáng môi trường mới
        const pointLight1 = new THREE.PointLight("#FACC15", 1.5, 25);
        pointLight1.position.set(0, 5, 0);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight("#86EFAC", 0.8, 20);
        pointLight2.position.set(-3, 4, 2);
        scene.add(pointLight2);

        const groundGeo = new THREE.CircleGeometry(30, 32);
        const groundMat = new THREE.MeshStandardMaterial({
            color: "#0A0505",
            roughness: 0.95,
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        scene.add(ground);

        const treeMaterial = new THREE.MeshStandardMaterial({
            color: TRUNK_COLOR,
            roughness: 0.9,
            metalness: 0.1,
        });

        const branchMaterial = new THREE.MeshStandardMaterial({
            color: BRANCH_COLOR,
            roughness: 0.85,
            metalness: 0.05,
        });

        branches.forEach((b) => {
            const dir = b.end.clone().sub(b.start);
            const length = dir.length();

            const geo = new THREE.CylinderGeometry(
                b.radius * 0.6,
                b.radius,
                length,
                b.depth < 2 ? 8 : 5,
                1
            );
            geo.translate(0, length / 2, 0);

            const mesh = new THREE.Mesh(geo, b.depth === 0 ? treeMaterial : branchMaterial);
            mesh.position.copy(b.start);

            const up = new THREE.Vector3(0, 1, 0);
            const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());
            mesh.quaternion.copy(quat);

            scene.add(mesh);
        });

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
            const rootGeo = new THREE.CylinderGeometry(0.05, 0.18, 1.2, 4);
            const rootMesh = new THREE.Mesh(rootGeo, treeMaterial);
            rootMesh.position.set(Math.cos(angle) * 0.5, -0.4, Math.sin(angle) * 0.5);
            rootMesh.rotation.z = (Math.random() - 0.5) * 0.5;
            rootMesh.rotation.x = (Math.random() - 0.5) * 0.5;
            scene.add(rootMesh);
        }

        const maxLeaves = CLUSTER_THRESHOLD;
        const leafGeo = new THREE.SphereGeometry(0.06, 6, 6);
        // Base color cho lá khi chưa được tô màu ngẫu nhiên
        const leafMat = new THREE.MeshStandardMaterial({
            color: "#4ADE80",
            emissive: "#22c55e",
            emissiveIntensity: GLOW_INTENSITY,
            transparent: true,
            opacity: 1,
        });
        const leafInstances = new THREE.InstancedMesh(leafGeo, leafMat, maxLeaves);
        leafInstances.count = 0;
        scene.add(leafInstances);

        const state = {
            scene,
            camera,
            renderer,
            leafInstances,
            clusterGroups: [] as THREE.Group[],
            animationId: 0,
            isDragging: false,
            prevMouse: { x: 0, y: 0 },
            cameraAngle: { theta: Math.PI / 4, phi: Math.PI / 5, radius: 14 },
            targetAngle: { theta: Math.PI / 4, phi: Math.PI / 5, radius: 14 },
            clock: new THREE.Clock(),
            branches,
            leafPositions,
            clusterPositions,
            prevPoints: 0,
            leafOpacities: [] as number[],
        };
        sceneRef.current = state;

        function animate() {
            state.animationId = requestAnimationFrame(animate);
            const time = state.clock.getElapsedTime();

            state.cameraAngle.theta += (state.targetAngle.theta - state.cameraAngle.theta) * 0.05;
            state.cameraAngle.phi += (state.targetAngle.phi - state.cameraAngle.phi) * 0.05;
            state.cameraAngle.radius += (state.targetAngle.radius - state.cameraAngle.radius) * 0.05;

            const r = state.cameraAngle.radius;
            const theta = state.cameraAngle.theta;
            const phi = state.cameraAngle.phi;
            camera.position.set(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.sin(phi) + 3,
                r * Math.cos(theta) * Math.cos(phi)
            );
            camera.lookAt(0, 3, 0);

            if (state.leafInstances && state.leafInstances.count > 0) {
                const dummy = new THREE.Object3D();
                for (let i = 0; i < state.leafInstances.count; i++) {
                    const matrix = new THREE.Matrix4();
                    state.leafInstances.getMatrixAt(i, matrix);
                    const pos = new THREE.Vector3();
                    pos.setFromMatrixPosition(matrix);

                    const offsetY = Math.sin(time * 1.5 + i * 0.7) * 0.03;
                    const offsetX = Math.sin(time * 0.8 + i * 1.1) * 0.02;

                    dummy.position.set(pos.x + offsetX, pos.y + offsetY, pos.z);

                    const opacity = state.leafOpacities[i] || 0;
                    if (opacity < 1) {
                        state.leafOpacities[i] = Math.min(1, opacity + 0.02);
                    }

                    const scale = 0.8 + Math.sin(time * 2 + i) * 0.2;
                    dummy.scale.setScalar(scale * (state.leafOpacities[i] || 0));
                    dummy.updateMatrix();
                    state.leafInstances.setMatrixAt(i, dummy.matrix);
                }
                state.leafInstances.instanceMatrix.needsUpdate = true;
            }

            state.clusterGroups.forEach((group, gi) => {
                group.children.forEach((child, ci) => {
                    if (child instanceof THREE.Points) {
                        child.rotation.z = Math.sin(time * 0.5 + gi * 0.8 + ci * 0.3) * 0.04;
                        child.rotation.x = Math.cos(time * 0.3 + gi * 0.5) * 0.02;
                    }
                });
            });

            pointLight1.intensity = 1.5 + Math.sin(time * 1.2) * 0.3;
            pointLight2.intensity = 0.8 + Math.sin(time * 0.9 + 1) * 0.2;

            renderer.render(scene, camera);
        }
        animate();

        const onMouseDown = (e: MouseEvent) => {
            state.isDragging = true;
            state.prevMouse = { x: e.clientX, y: e.clientY };
        };
        const onMouseMove = (e: MouseEvent) => {
            if (!state.isDragging) return;
            const dx = e.clientX - state.prevMouse.x;
            const dy = e.clientY - state.prevMouse.y;
            state.targetAngle.theta -= dx * 0.005;
            state.targetAngle.phi = Math.max(
                0.05,
                Math.min(Math.PI / 2.2, state.targetAngle.phi + dy * 0.005)
            );
            state.prevMouse = { x: e.clientX, y: e.clientY };
        };
        const onMouseUp = () => {
            state.isDragging = false;
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            state.targetAngle.radius = Math.max(
                6,
                Math.min(25, state.targetAngle.radius + e.deltaY * 0.01)
            );
        };

        const canvas = renderer.domElement;
        canvas.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("wheel", onWheel, { passive: false });

        const onResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(state.animationId);
            canvas.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            canvas.removeEventListener("wheel", onWheel);
            window.removeEventListener("resize", onResize);

            scene.traverse((object) => {
                const renderable = object as THREE.Mesh | THREE.Points | THREE.Line;

                if ((object as any).isMesh || (object as any).isPoints || (object as any).isLine) {
                    if (renderable.geometry) renderable.geometry.dispose();
                    if (renderable.material) {
                        if (Array.isArray(renderable.material)) {
                            renderable.material.forEach(m => m.dispose());
                        } else {
                            renderable.material.dispose();
                        }
                    }
                }
            });

            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, [branches, leafPositions, clusterPositions]);

    useEffect(() => {
        const state = sceneRef.current;
        if (!state) return;

        const currentLeaves = totalPoints % CLUSTER_THRESHOLD;
        const totalClusters = Math.floor(totalPoints / CLUSTER_THRESHOLD);

        const dummy = new THREE.Object3D();
        const rand = seededRandom(totalPoints * 7 + 13);

        if (state.leafInstances) {
            state.leafInstances.count = currentLeaves;
            state.leafOpacities = [];

            for (let i = 0; i < currentLeaves; i++) {
                const basePos = state.leafPositions[i % state.leafPositions.length];
                const offset = new THREE.Vector3(
                    (rand() - 0.5) * 1.5,
                    (rand() - 0.5) * 1.0,
                    (rand() - 0.5) * 1.5
                );
                dummy.position.copy(basePos).add(offset);

                const isNew = i >= (state.prevPoints % CLUSTER_THRESHOLD);
                dummy.scale.setScalar(isNew ? 0 : 1);
                state.leafOpacities.push(isNew ? 0 : 1);

                dummy.updateMatrix();
                state.leafInstances.setMatrixAt(i, dummy.matrix);

                const color = new THREE.Color(LEAF_COLORS[i % LEAF_COLORS.length]);
                state.leafInstances.setColorAt(i, color);
            }
            state.leafInstances.instanceMatrix.needsUpdate = true;
            if (state.leafInstances.instanceColor) {
                state.leafInstances.instanceColor.needsUpdate = true;
            }
        }

        state.clusterGroups.forEach((g) => {
            g.children.forEach((child) => {
                const renderable = child as THREE.Mesh | THREE.Points | THREE.Line;

                if (renderable.geometry) renderable.geometry.dispose();
                if (renderable.material) {
                    if (Array.isArray(renderable.material)) {
                        renderable.material.forEach(m => m.dispose());
                    } else {
                        renderable.material.dispose();
                    }
                }
            });
            state.scene.remove(g);
        });
        state.clusterGroups = [];

        // 2. TẠO CHÙM MỚI (TỐI ƯU HƠN)
        for (let c = 0; c < totalClusters; c++) {
            const clusterPos = state.clusterPositions[c % state.clusterPositions.length];
            const group = new THREE.Group();
            group.position.copy(clusterPos.position);

            const clusterRand = seededRandom(c * 137 + 42);
            // Giảm số lượng sợi dây và hạt để nhẹ máy hơn
            const numStrands = 4 + Math.floor(clusterRand() * 3);

            for (let s = 0; s < numStrands; s++) {
                const strandLength = 1.5 + clusterRand() * 2.5;
                const numBeads = 6 + Math.floor(clusterRand() * 6); // Giảm bớt số hạt

                const positions = new Float32Array(numBeads * 3);
                const colors = new Float32Array(numBeads * 3);
                const sizes = new Float32Array(numBeads);

                const offsetX = (clusterRand() - 0.5) * 0.8;
                const offsetZ = (clusterRand() - 0.5) * 0.8;

                for (let b = 0; b < numBeads; b++) {
                    const t = b / (numBeads - 1);
                    const waveX = Math.sin(t * Math.PI * 2 + s) * 0.08;
                    const waveZ = Math.cos(t * Math.PI * 1.5 + s * 0.7) * 0.06;

                    positions[b * 3] = offsetX + waveX;
                    positions[b * 3 + 1] = -t * strandLength;
                    positions[b * 3 + 2] = offsetZ + waveZ;

                    const col = new THREE.Color(CLUSTER_COLORS[b % CLUSTER_COLORS.length]);
                    const brightness = 0.5 + (1 - t) * 0.5;
                    colors[b * 3] = col.r * brightness;
                    colors[b * 3 + 1] = col.g * brightness;
                    colors[b * 3 + 2] = col.b * brightness;

                    sizes[b] = 3 + clusterRand() * 4;
                }

                const geo = new THREE.BufferGeometry();
                geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
                geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

                const mat = new THREE.PointsMaterial({
                    size: 0.1, // Tăng size lên xíu để bù lại việc bỏ PointLight
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.9,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                });

                const points = new THREE.Points(geo, mat);
                group.add(points);

                const lineMat = new THREE.LineBasicMaterial({
                    color: "#FDE047",
                    transparent: true,
                    opacity: 0.1, // Giảm opacity để đỡ rối mắt
                });
                const lineGeo = new THREE.BufferGeometry();
                lineGeo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
                const line = new THREE.Line(lineGeo, lineMat);
                group.add(line);
            }

            // XÓA PointLight Ở ĐÂY! (Hạt Points có AdditiveBlending là đủ phát sáng rồi)
            // Không dùng thêm đèn thực tế nữa để cứu GPU.

            state.scene.add(group);
            state.clusterGroups.push(group);
        }

        state.prevPoints = totalPoints;
    }, [totalPoints, leafPositions, clusterPositions]);

    return (
        <div
            ref={containerRef}
            onClick={onAddPoint}
            style={{
                width: "100%",
                height: "100%",
                cursor: "grab",
                position: "absolute",
                inset: 0,
            }}
        />
    );
}

// ─── MAIN COMPONENT ───
export default function KarmaTree() {
    const [totalPoints, setTotalPoints] = useState(0);
    const currentLeaves = totalPoints % CLUSTER_THRESHOLD;
    const totalClusters = Math.floor(totalPoints / CLUSTER_THRESHOLD);

    const addPoint = useCallback(() => {
        setTotalPoints((p) => p + 1);
    }, []);

    const addMany = useCallback((n: number) => {
        setTotalPoints((p) => p + n);
    }, []);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                background: FOG_COLOR,
                position: "relative",
                overflow: "hidden",
                fontFamily: "'Noto Serif', Georgia, serif",
            }}
        >
            <KarmaTreeCanvas totalPoints={totalPoints} onAddPoint={addPoint} />

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: "20px 24px",
                    background: "linear-gradient(180deg, rgba(2,5,3,0.85) 0%, transparent 100%)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    pointerEvents: "none",
                    zIndex: 10,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 9,
                            letterSpacing: "0.35em",
                            color: "#4ADE80",
                            textTransform: "uppercase",
                            marginBottom: 4,
                        }}
                    >
                        Karma Tree
                    </div>
                    <div
                        style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#F0E6C8",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Cây <span style={{ color: "#FACC15" }}>Công Đức</span>
                    </div>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div
                        style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: 36,
                            fontWeight: 700,
                            color: "#FACC15",
                            lineHeight: 1,
                            textShadow: "0 0 30px rgba(250,204,21,0.5)",
                        }}
                    >
                        {totalPoints}
                    </div>
                    <div style={{ fontSize: 9, color: "#4ADE80", letterSpacing: "0.2em" }}>
                        TỔNG CÔNG ĐỨC
                    </div>
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "24px",
                    background: "linear-gradient(0deg, rgba(2,5,3,0.9) 0%, transparent 100%)",
                    zIndex: 10,
                }}
            >
                <div style={{ maxWidth: 400, margin: "0 auto 16px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 10,
                            color: "#86EFAC",
                            marginBottom: 4,
                            letterSpacing: "0.15em",
                        }}
                    >
                        <span>🍃 {currentLeaves} / {CLUSTER_THRESHOLD} LÁ</span>
                        <span>✨ {totalClusters} CHÙM ĐÈN</span>
                    </div>
                    <div
                        style={{
                            height: 3,
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 2,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${(currentLeaves / CLUSTER_THRESHOLD) * 100}%`,
                                // Gradient chuyển mượt từ Xanh -> Vàng
                                background: "linear-gradient(90deg, #166534, #4ADE80, #FACC15)",
                                borderRadius: 2,
                                transition: "width 0.5s ease",
                            }}
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <button onClick={addPoint} style={btnStyle("#166534", "#4ADE80")}>
                        🪷 +1 Đức
                    </button>
                    <button onClick={() => addMany(10)} style={btnStyle("#A16207", "#FACC15")}>
                        ✨ +10
                    </button>
                    <button onClick={() => addMany(50)} style={btnStyle("#D97706", "#FDE047")}>
                        🌟 +50 (1 Chùm)
                    </button>
                    <button
                        onClick={() => setTotalPoints(0)}
                        style={{
                            ...btnStyle("#333", "#888"),
                            fontSize: 11,
                            padding: "8px 14px",
                        }}
                    >
                        Reset
                    </button>
                </div>

                <div
                    style={{
                        textAlign: "center",
                        fontSize: 10,
                        color: "rgba(240,230,200,0.2)",
                        marginTop: 12,
                        fontStyle: "italic",
                    }}
                >
                    Kéo để xoay · Scroll để zoom · Click vào cây để +1
                </div>
            </div>
        </div>
    );
}

function btnStyle(borderColor: string, textColor: string): React.CSSProperties {
    return {
        padding: "10px 20px",
        borderRadius: 6,
        border: `1px solid ${borderColor}`,
        background: `linear-gradient(135deg, ${borderColor}22, ${borderColor}08)`,
        color: textColor,
        fontFamily: "'Noto Serif', serif",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.06em",
        cursor: "pointer",
        transition: "all 0.25s",
    };
}