import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import * as THREE from "three";

// ─── CONSTANTS ───
const CLUSTER_THRESHOLD = 10;
const TRUNK_COLOR = "#2A1A0A";
const BRANCH_COLOR = "#3D2512";

// Tone màu lá và chùm sáng (Giữ nguyên)
const LEAF_COLORS = ["#73C92D", "#8EDE35", "#FFD700", "#FACC15", "#4ADE80"];
const CLUSTER_COLORS = ["#FDE047", "#FEF08A", "#86EFAC", "#4ADE80", "#FBBF24"];

const GLOW_INTENSITY = 2.5;

// TONE MÀU BÌNH MINH (DAWN) & ĐỒNG CỎ
const FOG_COLOR = "#d4c5b0"; // Màu sương mù buổi sáng sáng dịu
const AMBIENT_COLOR = "#8c8273"; // Ánh sáng môi trường trong trẻo
const GRASS_COLOR = "#3b5e2b"; // Màu cỏ xanh tươi

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

    function addBranch(start: THREE.Vector3, direction: THREE.Vector3, length: number, radius: number, depth: number) {
        if (depth > 5 || radius < 0.02) return;
        const end = start.clone().add(direction.clone().multiplyScalar(length));
        branches.push({ start: start.clone(), end: end.clone(), radius, depth, id: id++ });
        const numChildren = depth < 2 ? 3 + Math.floor(rand() * 2) : 2 + Math.floor(rand() * 2);

        for (let i = 0; i < numChildren; i++) {
            const spreadAngle = 0.3 + rand() * 0.6;
            const rotAngle = ((Math.PI * 2) / numChildren) * i + (rand() - 0.5) * 1.2;
            const newDir = direction.clone();
            const axis1 = new THREE.Vector3(Math.cos(rotAngle), 0, Math.sin(rotAngle)).normalize();
            newDir.applyAxisAngle(axis1, spreadAngle);
            if (depth < 2) newDir.y = Math.max(newDir.y, 0.15);

            const newLength = length * (0.55 + rand() * 0.25);
            const newRadius = radius * (0.5 + rand() * 0.2);
            addBranch(end.clone(), newDir.normalize(), newLength, newRadius, depth + 1);
        }
    }

    const trunkTop = new THREE.Vector3(0.15, 3.5, -0.1);
    branches.push({ start: new THREE.Vector3(0, -1, 0), end: trunkTop.clone(), radius: 0.65, depth: 0, id: id++ });

    const mainDirs = [
        new THREE.Vector3(-0.7, 0.6, 0.3), new THREE.Vector3(0.8, 0.5, -0.2),
        new THREE.Vector3(-0.3, 0.7, -0.6), new THREE.Vector3(0.4, 0.55, 0.7),
        new THREE.Vector3(-0.5, 0.8, 0.1), new THREE.Vector3(0.6, 0.45, -0.5),
    ];
    mainDirs.forEach((dir) => {
        addBranch(trunkTop.clone(), dir.normalize(), 2.2 + rand() * 1.2, 0.28 + rand() * 0.12, 1);
    });

    return branches;
}

function getLeafPositions(branches: BranchData[]): THREE.Vector3[] {
    return branches.filter((b) => b.depth >= 3).map((b) => b.end.clone());
}

function getClusterPositions(branches: BranchData[]): { position: THREE.Vector3; direction: THREE.Vector3 }[] {
    return branches.filter((b) => b.depth >= 2 && b.depth <= 3).map((b) => ({
        position: b.end.clone(),
        direction: b.end.clone().sub(b.start).normalize(),
    }));
}

// ═══════════════════════════════════════════
//  ENVIRONMENT BUILDERS (VALLEY AT DAWN)
// ═══════════════════════════════════════════

function createMountains(scene: THREE.Scene) {
    // Màu núi buổi sáng mang sắc rêu/lục xám nhạt
    const matFar = new THREE.MeshStandardMaterial({ color: '#4a5e47', roughness: 0.95 });
    const matMid = new THREE.MeshStandardMaterial({ color: '#3e4a3d', roughness: 0.92 });
    const matNear = new THREE.MeshStandardMaterial({ color: '#2b3824', roughness: 0.9 });

    // Tạo thành một vòng cung núi bao quanh thung lũng (Bao trùm 360 độ)
    const mountains = [
        // Lớp xa (Khổng lồ)
        { x: -35, z: -40, h: 28, r: 20, mat: matFar },
        { x: 0, z: -45, h: 32, r: 25, mat: matFar },
        { x: 35, z: -38, h: 25, r: 18, mat: matFar },
        { x: -45, z: -10, h: 24, r: 18, mat: matFar },
        { x: 45, z: 0, h: 26, r: 19, mat: matFar },

        // Lớp giữa
        { x: -20, z: -25, h: 18, r: 14, mat: matMid },
        { x: 15, z: -28, h: 16, r: 12, mat: matMid },
        { x: 30, z: -15, h: 15, r: 10, mat: matMid },
        { x: -30, z: 5, h: 14, r: 11, mat: matMid },
        { x: -25, z: -15, h: 12, r: 9, mat: matMid },

        // Lớp gần che chắn 2 bên
        { x: -25, z: 15, h: 10, r: 8, mat: matNear },
        { x: 28, z: 10, h: 9, r: 7, mat: matNear },
        { x: -18, z: -10, h: 8, r: 6, mat: matNear },
        { x: 22, z: -12, h: 7, r: 5, mat: matNear },
    ];

    mountains.forEach(p => {
        const mesh = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 6), p.mat);
        mesh.position.set(p.x, p.h * 0.3 - 2, p.z);
        // Xoay nhẹ cho tự nhiên
        mesh.rotation.y = Math.random() * Math.PI;
        scene.add(mesh);
    });
}

function createTemple(scene: THREE.Scene) {
    // Ngôi chùa tông màu tường vàng, cột đỏ sẫm đặc trưng
    const wallMat = new THREE.MeshStandardMaterial({ color: '#dca626', roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: '#5a2e15', roughness: 0.8 });
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.7 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#7a7a7a', roughness: 0.9 });

    const temple = new THREE.Group();

    // Nền đá
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 3.2), stoneMat);
    base.position.set(0, 0, 0);
    temple.add(base);

    // Bức tường chính (Nhà màu vàng)
    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, 2), wallMat);
    mainHall.position.set(0, 1.4, 0);
    temple.add(mainHall);

    // Cửa chính (Màu tối)
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.6), new THREE.MeshStandardMaterial({ color: '#2a1a10' }));
    door.position.set(0, 1.0, 1.01);
    temple.add(door);

    // 4 Cột đỏ phía trước và sau
    for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.8, 8), pillarMat);
        p.position.set((i % 2 === 0 ? -1 : 1) * 1.8, 1.6, (i < 2 ? -1 : 1) * 1.2);
        temple.add(p);
    }

    // Mái chữ A
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.5, 4), roofMat);
    roof.position.y = 3.4;
    roof.rotation.y = Math.PI / 4;
    temple.add(roof);

    // Đặt chùa bên trái cây
    temple.position.set(-10, -0.8, -6);
    temple.rotation.y = 0.3; // Hơi nghiêng hướng về giữa
    temple.scale.setScalar(0.85);
    scene.add(temple);
}

function createWell(scene: THREE.Scene) {
    const wellGroup = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.95 });
    const darkHole = new THREE.MeshBasicMaterial({ color: '#050505' });
    const wood = new THREE.MeshStandardMaterial({ color: '#4a2c1a', roughness: 0.8 });

    // Đáy giếng bằng đá
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 0.8, 12), stone);
    base.position.y = 0.4;
    wellGroup.add(base);

    // Miệng lỗ đen
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.81, 12), darkHole);
    hole.position.y = 0.4;
    wellGroup.add(hole);

    // 2 cột trụ gỗ
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), wood);
    pillarL.position.set(-0.5, 1.1, 0);
    wellGroup.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), wood);
    pillarR.position.set(0.5, 1.1, 0);
    wellGroup.add(pillarR);

    // Trục quay
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), wood);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 1.6;
    wellGroup.add(bar);

    // Mái che nhỏ
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.6, 4), wood);
    roof.position.y = 2.4;
    roof.rotation.y = Math.PI / 4;
    wellGroup.add(roof);

    // Đặt giếng NẰM SÁT bên cạnh chùa
    wellGroup.position.set(-7.5, -1, -4.5);
    wellGroup.scale.setScalar(0.8);
    scene.add(wellGroup);
}

function createPampasGrass(scene: THREE.Scene) {
    const count = 350; // Đám cỏ lau rộng
    const stalkGeo = new THREE.CylinderGeometry(0.015, 0.03, 1.2, 3);
    stalkGeo.translate(0, 0.6, 0);
    const stalkMat = new THREE.MeshStandardMaterial({ color: '#8b995e', roughness: 0.8 });
    const stalkInst = new THREE.InstancedMesh(stalkGeo, stalkMat, count);

    // Bông lau (Dùng hình cầu kéo dài xốp xốp)
    const plumeGeo = new THREE.SphereGeometry(0.12, 5, 5);
    const plumeMat = new THREE.MeshStandardMaterial({ color: '#e8e0ce', roughness: 0.9, transparent: true, opacity: 0.9 });
    const plumeInst = new THREE.InstancedMesh(plumeGeo, plumeMat, count);

    const dummy = new THREE.Object3D();
    const rand = seededRandom(777);

    for (let i = 0; i < count; i++) {
        // Trải rộng bên phải
        const x = 7 + rand() * 15;
        const z = -2 + rand() * -18;
        const scale = 0.7 + rand() * 0.6;

        // Thân
        dummy.position.set(x, -1, z);
        dummy.rotation.y = rand() * Math.PI;
        dummy.rotation.z = (rand() - 0.5) * 0.3; // Cỏ nghiêng nhẹ
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        stalkInst.setMatrixAt(i, dummy.matrix);

        // Bông
        dummy.position.set(x + Math.sin(dummy.rotation.z) * 1.2 * scale, -1 + 1.2 * scale, z);
        dummy.scale.set(scale, scale * 3, scale); // Kéo dài hình cầu thành bông
        dummy.updateMatrix();
        plumeInst.setMatrixAt(i, dummy.matrix);
    }

    scene.add(stalkInst);
    scene.add(plumeInst);
}

function createSun(scene: THREE.Scene) {
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(4.0, 32, 32),
        // Mặt trời sáng rực lúc bình minh
        new THREE.MeshBasicMaterial({ color: '#ffdd88', fog: false })
    );
    // Đặt ở chân trời sau núi
    sun.position.set(0, 8, -40);
    scene.add(sun);

    const halo = new THREE.Mesh(
        new THREE.SphereGeometry(7.0, 32, 32),
        new THREE.MeshBasicMaterial({ color: '#ffaa55', transparent: true, opacity: 0.2, fog: false })
    );
    halo.position.copy(sun.position);
    scene.add(halo);

    // Ánh nắng bình minh sưởi ấm
    const sunLight = new THREE.DirectionalLight('#ffddaa', 1.5);
    sunLight.position.copy(sun.position);
    sunLight.target.position.set(0, 0, 0);
    scene.add(sunLight);
    scene.add(sunLight.target);
}

function createMistLayers(scene: THREE.Scene): THREE.Mesh[] {
    const mists: THREE.Mesh[] = [];
    const configs = [
        { y: 0.3, z: -4, w: 50, h: 2.5, opacity: 0.1 },
        { y: 1.5, z: -8, w: 55, h: 3.0, opacity: 0.08 },
        { y: 2.8, z: -14, w: 60, h: 4.0, opacity: 0.05 },
    ];
    configs.forEach(c => {
        const mat = new THREE.MeshBasicMaterial({ color: FOG_COLOR, transparent: true, opacity: c.opacity, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(c.w, c.h), mat);
        mesh.position.set(0, c.y, c.z);
        mesh.rotation.x = -Math.PI * 0.04;
        mists.push(mesh); scene.add(mesh);
    });
    return mists;
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
        mists: THREE.Mesh[];
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
        scene.fog = new THREE.FogExp2(FOG_COLOR, 0.015);

        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
        camera.position.set(8, 5, 8);
        camera.lookAt(0, 3, 0);

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(AMBIENT_COLOR, 1.2);
        scene.add(ambient);

        // Ánh sáng bổ trợ tôn cảnh
        const pointLight1 = new THREE.PointLight("#FACC15", 1.5, 30);
        pointLight1.position.set(0, 5, 0);
        scene.add(pointLight1);

        // NỀN ĐẤT LÀ THẢM CỎ XANH MƯỚT
        const groundGeo = new THREE.PlaneGeometry(100, 100, 32, 32);
        // Tạo gồ ghề nhẹ cho đất
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.setZ(i, (Math.random() - 0.5) * 0.5);
        }
        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({
            color: GRASS_COLOR,
            roughness: 0.9,
            flatShading: true
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        scene.add(ground);

        // Khởi tạo toàn bộ Môi trường Thung Lũng
        createMountains(scene);
        createTemple(scene);
        createWell(scene); // Giếng cạnh chùa
        createPampasGrass(scene); // Đồi cỏ lau bên phải
        createSun(scene);
        const mists = createMistLayers(scene);

        // Dải lụa đỏ
        const ribbonGeo = new THREE.PlaneGeometry(0.15, 0.8);
        ribbonGeo.translate(0, -0.4, 0);
        const ribbonMat = new THREE.MeshBasicMaterial({ color: "#dc2626", side: THREE.DoubleSide });
        const ribbons: THREE.Mesh[] = [];
        branches.filter(b => b.depth === 3).forEach((b) => {
            if (Math.random() > 0.7) {
                const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
                ribbon.position.copy(b.end);
                ribbon.rotation.y = Math.random() * Math.PI;
                scene.add(ribbon);
                ribbons.push(ribbon);
            }
        });

        // Bỏ bớt đóm đóm (giảm xuống còn 50 con cho không gian ban ngày bớt rối)
        const firefliesCount = 50;
        const firefliesGeo = new THREE.BufferGeometry();
        const firefliesPos = new Float32Array(firefliesCount * 3);
        const firefliesPhase = new Float32Array(firefliesCount);
        for (let i = 0; i < firefliesCount; i++) {
            firefliesPos[i * 3] = (Math.random() - 0.5) * 20;
            firefliesPos[i * 3 + 1] = Math.random() * 10;
            firefliesPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
            firefliesPhase[i] = Math.random() * Math.PI * 2;
        }
        firefliesGeo.setAttribute("position", new THREE.BufferAttribute(firefliesPos, 3));
        firefliesGeo.setAttribute("phase", new THREE.BufferAttribute(firefliesPhase, 1));
        const firefliesMat = new THREE.PointsMaterial({
            size: 0.08, color: "#FACC15", transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const fireflies = new THREE.Points(firefliesGeo, firefliesMat);
        scene.add(fireflies);

        // Cành & Thân cây chính ở Giữa
        const treeMaterial = new THREE.MeshStandardMaterial({ color: TRUNK_COLOR, roughness: 0.9, metalness: 0.1 });
        const branchMaterial = new THREE.MeshStandardMaterial({ color: BRANCH_COLOR, roughness: 0.85, metalness: 0.05 });

        branches.forEach((b) => {
            const dir = b.end.clone().sub(b.start);
            const length = dir.length();
            const geo = new THREE.CylinderGeometry(b.radius * 0.6, b.radius, length, b.depth < 2 ? 8 : 5, 1);
            geo.translate(0, length / 2, 0);
            const mesh = new THREE.Mesh(geo, b.depth === 0 ? treeMaterial : branchMaterial);
            mesh.position.copy(b.start);
            const up = new THREE.Vector3(0, 1, 0);
            mesh.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()));
            scene.add(mesh);
        });

        // Rễ cây
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
        const leafMat = new THREE.MeshStandardMaterial({
            color: "#4ADE80", emissive: "#22c55e", emissiveIntensity: GLOW_INTENSITY,
            transparent: true, opacity: 1,
        });
        const leafInstances = new THREE.InstancedMesh(leafGeo, leafMat, maxLeaves);
        leafInstances.count = 0;
        scene.add(leafInstances);

        const state = {
            scene, camera, renderer, leafInstances, clusterGroups: [] as THREE.Group[],
            animationId: 0, isDragging: false, prevMouse: { x: 0, y: 0 },
            cameraAngle: { theta: Math.PI / 4, phi: Math.PI / 5, radius: 14 },
            targetAngle: { theta: Math.PI / 4, phi: Math.PI / 5, radius: 14 },
            clock: new THREE.Clock(), branches, leafPositions, clusterPositions,
            prevPoints: 0, leafOpacities: [] as number[], mists
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
            camera.position.set(r * Math.sin(theta) * Math.cos(phi), r * Math.sin(phi) + 3, r * Math.cos(theta) * Math.cos(phi));
            camera.lookAt(0, 3, 0);

            if (state.leafInstances && state.leafInstances.count > 0) {
                const dummy = new THREE.Object3D();
                for (let i = 0; i < state.leafInstances.count; i++) {
                    const matrix = new THREE.Matrix4();
                    state.leafInstances.getMatrixAt(i, matrix);
                    const pos = new THREE.Vector3().setFromMatrixPosition(matrix);
                    const offsetY = Math.sin(time * 1.5 + i * 0.7) * 0.03;
                    const offsetX = Math.sin(time * 0.8 + i * 1.1) * 0.02;

                    dummy.position.set(pos.x + offsetX, pos.y + offsetY, pos.z);
                    const opacity = state.leafOpacities[i] || 0;
                    if (opacity < 1) state.leafOpacities[i] = Math.min(1, opacity + 0.02);

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

            pointLight1.intensity = 1.5 + Math.sin(time * 1.2) * 0.4;

            ribbons.forEach((ribbon, i) => {
                ribbon.rotation.x = Math.sin(time * 2 + i) * 0.15;
                ribbon.rotation.z = Math.cos(time * 1.5 + i) * 0.1;
            });

            const positions = fireflies.geometry.attributes.position.array as Float32Array;
            const phases = fireflies.geometry.attributes.phase.array as Float32Array;
            for (let i = 0; i < firefliesCount; i++) {
                positions[i * 3 + 1] += Math.sin(time * 0.5 + phases[i]) * 0.01;
                if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -1;
                positions[i * 3] += Math.sin(time * 0.3 + phases[i]) * 0.005;
                positions[i * 3 + 2] += Math.cos(time * 0.4 + phases[i]) * 0.005;
            }
            fireflies.geometry.attributes.position.needsUpdate = true;
            firefliesMat.opacity = 0.2 + Math.sin(time * 3) * 0.2;

            state.mists.forEach((m, i) => {
                m.position.x = Math.sin(time * 0.08 + i * 2.5) * 6;
                (m.material as THREE.MeshBasicMaterial).opacity = 0.03 + Math.sin(time * 0.15 + i * 1.3) * 0.015;
            });

            renderer.render(scene, camera);
        }
        animate();

        const onMouseDown = (e: MouseEvent) => { state.isDragging = true; state.prevMouse = { x: e.clientX, y: e.clientY }; };
        const onMouseMove = (e: MouseEvent) => {
            if (!state.isDragging) return;
            state.targetAngle.theta -= (e.clientX - state.prevMouse.x) * 0.005;
            state.targetAngle.phi = Math.max(0.05, Math.min(Math.PI / 2.2, state.targetAngle.phi + (e.clientY - state.prevMouse.y) * 0.005));
            state.prevMouse = { x: e.clientX, y: e.clientY };
        };
        const onMouseUp = () => { state.isDragging = false; };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            state.targetAngle.radius = Math.max(6, Math.min(25, state.targetAngle.radius + e.deltaY * 0.01));
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
                        if (Array.isArray(renderable.material)) renderable.material.forEach(m => m.dispose());
                        else renderable.material.dispose();
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
                const offset = new THREE.Vector3((rand() - 0.5) * 1.5, (rand() - 0.5) * 1.0, (rand() - 0.5) * 1.5);
                dummy.position.copy(basePos).add(offset);

                const isNew = i >= (state.prevPoints % CLUSTER_THRESHOLD);
                dummy.scale.setScalar(isNew ? 0 : 1);
                state.leafOpacities.push(isNew ? 0 : 1);

                dummy.updateMatrix();
                state.leafInstances.setMatrixAt(i, dummy.matrix);
                state.leafInstances.setColorAt(i, new THREE.Color(LEAF_COLORS[i % LEAF_COLORS.length]));
            }
            state.leafInstances.instanceMatrix.needsUpdate = true;
            if (state.leafInstances.instanceColor) state.leafInstances.instanceColor.needsUpdate = true;
        }

        state.clusterGroups.forEach((g) => {
            g.children.forEach((child) => {
                const renderable = child as THREE.Mesh | THREE.Points | THREE.Line;
                if (renderable.geometry) renderable.geometry.dispose();
                if (renderable.material) {
                    if (Array.isArray(renderable.material)) renderable.material.forEach(m => m.dispose());
                    else renderable.material.dispose();
                }
            });
            state.scene.remove(g);
        });
        state.clusterGroups = [];

        for (let c = 0; c < totalClusters; c++) {
            const clusterPos = state.clusterPositions[c % state.clusterPositions.length];
            const group = new THREE.Group();
            group.position.copy(clusterPos.position);

            const clusterRand = seededRandom(c * 137 + 42);
            const numStrands = 4 + Math.floor(clusterRand() * 3);

            for (let s = 0; s < numStrands; s++) {
                const strandLength = 1.5 + clusterRand() * 2.5;
                const numBeads = 6 + Math.floor(clusterRand() * 6);
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
                    size: 0.1, vertexColors: true, transparent: true, opacity: 0.9,
                    blending: THREE.AdditiveBlending, depthWrite: false,
                });
                group.add(new THREE.Points(geo, mat));

                const lineGeo = new THREE.BufferGeometry();
                lineGeo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
                group.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: "#FDE047", transparent: true, opacity: 0.1 })));
            }
            state.scene.add(group);
            state.clusterGroups.push(group);
        }
        state.prevPoints = totalPoints;
    }, [totalPoints, leafPositions, clusterPositions]);

    return (
        <div ref={containerRef} onClick={onAddPoint} style={{ width: "100%", height: "100%", cursor: "grab", position: "absolute", inset: 0 }} />
    );
}

// ─── MAIN COMPONENT ───
export default function KarmaTree() {
    const [totalPoints, setTotalPoints] = useState(0);
    const currentLeaves = totalPoints % CLUSTER_THRESHOLD;
    const totalClusters = Math.floor(totalPoints / CLUSTER_THRESHOLD);

    const addPoint = useCallback(() => setTotalPoints((p) => p + 1), []);
    const addMany = useCallback((n: number) => setTotalPoints((p) => p + n), []);

    return (
        <div style={{ width: "100%", height: "100vh", background: FOG_COLOR, position: "relative", overflow: "hidden", fontFamily: "'Noto Serif', Georgia, serif" }}>
            <KarmaTreeCanvas totalPoints={totalPoints} onAddPoint={addPoint} />

            <div
                style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    padding: "20px 24px",
                    // Đổi overlay sang tông rêu phong/xanh lục thẫm cho hợp nền cỏ sáng
                    background: "linear-gradient(180deg, rgba(20,30,20,0.85) 0%, transparent 100%)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    pointerEvents: "none", zIndex: 10,
                }}
            >
                <div>
                    <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#4ADE80", textTransform: "uppercase", marginBottom: 4 }}>Karma Tree</div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#F0E6C8", letterSpacing: "0.08em" }}>
                        Cây <span style={{ color: "#FACC15" }}>Công Đức</span>
                    </div>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 36, fontWeight: 700, color: "#FACC15", lineHeight: 1, textShadow: "0 0 30px rgba(250,204,21,0.5)" }}>
                        {totalPoints}
                    </div>
                    <div style={{ fontSize: 9, color: "#4ADE80", letterSpacing: "0.2em" }}>TỔNG CÔNG ĐỨC</div>
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    padding: "24px",
                    background: "linear-gradient(0deg, rgba(20,30,20,0.9) 0%, transparent 100%)",
                    zIndex: 10,
                }}
            >
                <div style={{ maxWidth: 400, margin: "0 auto 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#86EFAC", marginBottom: 4, letterSpacing: "0.15em" }}>
                        <span>🍃 {currentLeaves} / {CLUSTER_THRESHOLD} LÁ</span>
                        <span>✨ {totalClusters} CHÙM ĐÈN</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(currentLeaves / CLUSTER_THRESHOLD) * 100}%`, background: "linear-gradient(90deg, #166534, #4ADE80, #FACC15)", borderRadius: 2, transition: "width 0.5s ease" }} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={addPoint} style={btnStyle("#166534", "#4ADE80")}>🪷 +1 Đức</button>
                    <button onClick={() => addMany(10)} style={btnStyle("#A16207", "#FACC15")}>✨ +10</button>
                    <button onClick={() => addMany(50)} style={btnStyle("#D97706", "#FDE047")}>🌟 +50 (1 Chùm)</button>
                    <button onClick={() => setTotalPoints(0)} style={{ ...btnStyle("#333", "#888"), fontSize: 11, padding: "8px 14px" }}>Reset</button>
                </div>

                <div style={{ textAlign: "center", fontSize: 10, color: "rgba(240,230,200,0.4)", marginTop: 12, fontStyle: "italic" }}>
                    Kéo để xoay · Scroll để zoom · Click vào cây để +1
                </div>
            </div>
        </div>
    );
}

function btnStyle(borderColor: string, textColor: string): React.CSSProperties {
    return {
        padding: "10px 20px", borderRadius: 6, border: `1px solid ${borderColor}`,
        background: `linear-gradient(135deg, ${borderColor}22, ${borderColor}08)`, color: textColor,
        fontFamily: "'Noto Serif', serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
        cursor: "pointer", transition: "all 0.25s",
    };
}