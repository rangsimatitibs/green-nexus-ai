import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const FloatingShape = ({ position, geometry, speed }: { position: [number, number, number], geometry: 'box' | 'sphere' | 'torus' | 'octahedron', speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotate the shape
    meshRef.current.rotation.x += speed * 0.5;
    meshRef.current.rotation.y += speed * 0.3;
    
    // Float up and down
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 16, 16]} />;
      case 'torus':
        return <torusGeometry args={[0.4, 0.2, 16, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.6]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      {renderGeometry()}
      <meshStandardMaterial 
        color="#2dd4bf" 
        transparent 
        opacity={0.15}
        wireframe={false}
        emissive="#2dd4bf"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const FloatingShapes = () => {
  const shapes: Array<{ position: [number, number, number], geometry: 'box' | 'sphere' | 'torus' | 'octahedron', speed: number }> = [
    { position: [-4, 2, -3], geometry: 'box', speed: 0.4 },
    { position: [5, -1, -4], geometry: 'sphere', speed: 0.3 },
    { position: [-6, -2, -2], geometry: 'torus', speed: 0.5 },
    { position: [4, 3, -5], geometry: 'octahedron', speed: 0.35 },
    { position: [7, 1, -3], geometry: 'box', speed: 0.45 },
    { position: [-3, -3, -4], geometry: 'sphere', speed: 0.4 },
    { position: [2, 4, -2], geometry: 'torus', speed: 0.3 },
    { position: [-7, 1, -5], geometry: 'octahedron', speed: 0.5 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        {shapes.map((shape, index) => (
          <FloatingShape key={index} {...shape} />
        ))}
      </Canvas>
    </div>
  );
};

export default FloatingShapes;
