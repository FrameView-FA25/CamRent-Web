import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Box, CircularProgress } from "@mui/material";
import * as THREE from "three";

interface CameraModelProps {
  modelPath?: string;
}

function Model({ modelPath = "/camera.glb" }) {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    // Fix common GLB export issues that can look "see-through":
    // - backface culling on thin geometry
    // - incorrect depthWrite when transparency isn't actually needed
    scene.traverse((obj) => {
      const mesh = obj as unknown as THREE.Mesh;
      if (!mesh?.isMesh) return;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        if (!mat) return;
        mat.side = THREE.DoubleSide;
        // If exporter marked it transparent but it's fully opaque, treat as opaque.
        const transparent =
          (mat as THREE.Material & { transparent?: boolean }).transparent ??
          false;
        const opacity = (mat as THREE.Material & { opacity?: number }).opacity;

        if (transparent && (opacity === undefined || opacity >= 1)) {
          (mat as THREE.Material & { transparent?: boolean }).transparent =
            false;
        }

        const nowTransparent =
          (mat as THREE.Material & { transparent?: boolean }).transparent ??
          false;
        (mat as THREE.Material & { depthWrite?: boolean }).depthWrite =
          !nowTransparent;
        mat.needsUpdate = true;
      });
    });
  }, [scene]);

  return <primitive object={scene} scale={16.5} />;
}

const CameraModel: React.FC<CameraModelProps> = ({ modelPath }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "500px",
        maxHeight: "500px",
        minHeight: "500px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 50,
        }}
        style={{
          background: "transparent",
          width: "100%",
          height: "100%",
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model modelPath={modelPath} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>

      {/* Loading indicator */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: -1,
        }}
      >
        <CircularProgress sx={{ color: "#F97316" }} />
      </Box>
    </Box>
  );
};

export default CameraModel;
