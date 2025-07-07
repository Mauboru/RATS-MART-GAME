export function willCollide(entityA, entityB, dx = 0, dy = 0) {
  if (!entityA || !entityB) {
      return false;
  }

  if (!entityA.collisionRegion || !entityB.collisionRegion) {
      return false;
  }

  const a = {
      x: entityA.x + entityA.collisionRegion.x + dx,
      y: entityA.y + entityA.collisionRegion.y + dy,
      width: entityA.collisionRegion.width,
      height: entityA.collisionRegion.height,
  };

  const b = {
      x: entityB.x + entityB.collisionRegion.x,
      y: entityB.y + entityB.collisionRegion.y,
      width: entityB.collisionRegion.width,
      height: entityB.collisionRegion.height,
  };

  return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
  );
}