import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Container, ContainerPriority } from '@/types';
import { Colors } from '@/constants/colors';

interface TruckSceneProps {
  containers: Container[];
  /** Truck interior dimensions in metres (defaults: 6m x 2.4m x 2.5m) */
  truckLength?: number;
  truckWidth?: number;
  truckHeight?: number;
}

const PRIORITY_COLORS: Record<ContainerPriority, number> = {
  [ContainerPriority.URGENT]: 0xff3b30,
  [ContainerPriority.SEMAINE]: 0xff9500,
  [ContainerPriority.PAS_PRESSE]: 0x34c759,
};

// Box sizes in metres (estimated by container type)
const BOX_DEFAULT = { w: 0.4, h: 0.35, d: 0.4 };

export default function TruckScene({
  containers,
  truckLength = 6,
  truckWidth = 2.4,
  truckHeight = 2.5,
}: TruckSceneProps) {
  const onContextCreate = useCallback(async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xf9f9fb);

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      100
    );
    camera.position.set(truckLength * 0.8, truckHeight * 1.6, truckWidth * 2.5);
    camera.lookAt(truckLength / 2, truckHeight / 2, truckWidth / 2);

    // Ambient + directional light
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(truckLength, truckHeight * 2, truckWidth);
    scene.add(dirLight);

    // Truck wireframe (floor + walls, no top)
    const truckMat = new THREE.LineBasicMaterial({ color: 0xc7c7cc });
    const edges = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(truckLength, truckHeight, truckWidth)
    );
    const truck = new THREE.LineSegments(edges, truckMat);
    truck.position.set(truckLength / 2, truckHeight / 2, truckWidth / 2);
    scene.add(truck);

    // Floor grid
    const gridHelper = new THREE.GridHelper(Math.max(truckLength, truckWidth), 10, 0xe5e5ea, 0xe5e5ea);
    gridHelper.position.set(truckLength / 2, 0, truckWidth / 2);
    scene.add(gridHelper);

    // Pack boxes greedily along the floor
    let x = 0.05;
    let z = 0.05;
    let rowMaxH = 0;

    for (const container of containers) {
      const bw = container.widthCm ? container.widthCm / 100 : BOX_DEFAULT.w;
      const bh = container.heightCm ? container.heightCm / 100 : BOX_DEFAULT.h;
      const bd = container.depthCm ? container.depthCm / 100 : BOX_DEFAULT.d;

      if (x + bw > truckLength - 0.05) {
        x = 0.05;
        z += rowMaxH + 0.05;
        rowMaxH = 0;
      }
      if (z + bd > truckWidth - 0.05) break; // truck full

      const geo = new THREE.BoxGeometry(bw, bh, bd);
      const mat = new THREE.MeshLambertMaterial({
        color: PRIORITY_COLORS[container.priority],
        transparent: true,
        opacity: 0.85,
      });
      const box = new THREE.Mesh(geo, mat);
      box.position.set(x + bw / 2, bh / 2, z + bd / 2);
      scene.add(box);

      // Edge outline
      const boxEdges = new THREE.EdgesGeometry(geo);
      const boxLine = new THREE.LineSegments(
        boxEdges,
        new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 })
      );
      box.add(boxLine);

      x += bw + 0.05;
      if (bd > rowMaxH) rowMaxH = bd;
    }

    // Animate (slow rotation around Y)
    let angle = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      angle += 0.003;
      camera.position.x = truckLength / 2 + Math.cos(angle) * truckLength * 1.4;
      camera.position.z = truckWidth / 2 + Math.sin(angle) * truckLength * 1.4;
      camera.lookAt(truckLength / 2, truckHeight / 2, truckWidth / 2);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  }, [containers, truckLength, truckWidth, truckHeight]);

  return (
    <View style={styles.container}>
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  gl: { flex: 1 },
});
