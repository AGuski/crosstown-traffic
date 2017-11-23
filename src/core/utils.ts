export class Utils {

  static getCenterDistance(pathA: Snap.Element, pathB: Snap.Element): number {
    const c1 = { x: pathA.getBBox().cx, y: pathA.getBBox().cy };
    const c2 = { x: pathB.getBBox().cx, y: pathB.getBBox().cy };
    const a = c2.x - c1.x;
    const b = c2.y - c1.y;
    return Math.sqrt(Math.pow(a, 2)+Math.pow(b,2));
  }

  static getIntersection(origin1, dir1, origin2, dir2): number[] {
    let P = [origin1.x, origin1.y];
    let Q = [origin2.x, origin2.y];
    let r = [Math.cos(dir1), Math.sin(dir1)];
    let s = [Math.cos(dir2), Math.sin(dir2)];
    
    var PQx = Q[0] - P[0];
    var PQy = Q[1] - P[1];
    var rx = r[0];
    var ry = r[1];
    var rxt = -ry;
    var ryt = rx;
    var qx = PQx * rx + PQy * ry;
    var qy = PQx * rxt + PQy * ryt;
    var sx = s[0] * rx + s[1] * ry;
    var sy = s[0] * rxt + s[1] * ryt;
    // if lines are identical or do not cross...
    if (sy == 0) return null;
    var a = qx - qy * sx / sy;
    return [ P[0] + a * rx, P[1] + a * ry ];
  }

  static getLengthFromPoint(path, targetPoint): number {
    const margin = 0.5;
    for (var length = 0; length < path.getTotalLength(); length++) {
      const currentPoint = path.getPointAtLength(length);
      const isX = currentPoint.x > targetPoint.x-margin &&
                  currentPoint.x < targetPoint.x+margin;
      const isY = currentPoint.y > targetPoint.y-margin &&
                  currentPoint.y < targetPoint.y+margin;
      if ( isX && isY){
        return length;
      };
    }
  }
}