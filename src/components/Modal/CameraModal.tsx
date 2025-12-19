import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Box, CircularProgress } from "@mui/material";

interface CameraModelProps {
  modelPath?: string;
}

function Model({ modelPath = "/camera.glb" }) {
  const { scene } = useGLTF(modelPath);
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
            enablePan={true}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            minAzimuthAngle={-Math.PI}
            maxAzimuthAngle={Math.PI}
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
