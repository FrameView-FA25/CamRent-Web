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
    // Fix common glTF material issues that cause "see-through" / layer-overlap artifacts:
    // - alphaMode=BLEND on opaque parts => wrong depth sorting
    // - transparent materials default to depthWrite=false => objects behind bleed through
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        if (!mat) return;
        const anyMat = mat as unknown as THREE.MeshStandardMaterial & {
          alphaMap?: THREE.Texture | null;
          alphaTest?: number;
          transmission?: number;
          thickness?: number;
        };

        // Prefer front faces for closed meshes to reduce self-overlap artifacts.
        // (If your model relies on DoubleSide, remove this.)
        anyMat.side = THREE.FrontSide;

        // If material is flagged transparent but effectively opaque, treat as opaque.
        const hasTransmission =
          typeof anyMat.transmission === "number" && anyMat.transmission > 0;
        const opacityIsOpaque =
          typeof anyMat.opacity === "number" ? anyMat.opacity >= 1 : true;

        if (anyMat.transparent && opacityIsOpaque && !hasTransmission) {
          anyMat.transparent = false;
        }

        // If there's alpha intended as cutout (decals/labels), use alphaTest instead of blending.
        if (anyMat.alphaMap && !hasTransmission) {
          anyMat.alphaTest = Math.max(anyMat.alphaTest ?? 0, 0.5);
          anyMat.transparent = false;
        }

        // Ensure depth is written to avoid "see-through layers" on models that shipped as transparent.
        anyMat.depthTest = true;
        anyMat.depthWrite = true;

        // Color texture space (safe; glTF usually sets this but some exports don't).
        if ((anyMat.map as THREE.Texture | null)?.isTexture) {
          (anyMat.map as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
          (anyMat.map as THREE.Texture).needsUpdate = true;
        }

        anyMat.needsUpdate = true;
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
          near: 0.1,
          far: 100,
        }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
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
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <CircularProgress sx={{ color: "#F97316" }} />
      </Box>
    </Box>
  );
};

export default CameraModel;

useGLTF.preload("/camera.glb");
