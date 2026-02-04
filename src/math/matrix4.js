class Matrix4 {
    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }

    identity() {
        const e = this.elements;
        e[0] = 1; e[4] = 0; e[8] = 0; e[12] = 0;
        e[1] = 0; e[5] = 1; e[9] = 0; e[13] = 0;
        e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
        e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
        return this;
    }

    static perspective(fov, aspect, near, far) {
        const matrix = new Matrix4();
        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1.0 / (near - far);

        const e = matrix.elements;
        e[0] = f / aspect;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;

        e[4] = 0;
        e[5] = f;
        e[6] = 0;
        e[7] = 0;

        e[8] = 0;
        e[9] = 0;
        e[10] = (near + far) * rangeInv;
        e[11] = -1;

        e[12] = 0;
        e[13] = 0;
        e[14] = near * far * rangeInv * 2;
        e[15] = 0;

        return matrix;
    }

    static orthographic(left, right, bottom, top, near, far) {
        const matrix = new Matrix4();
        const e = matrix.elements;

        const width = right - left;
        const height = top - bottom;
        const depth = far - near;

        e[0] = 2 / width;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;

        e[4] = 0;
        e[5] = 2 / height;
        e[6] = 0;
        e[7] = 0;

        e[8] = 0;
        e[9] = 0;
        e[10] = -2 / depth;
        e[11] = 0;

        e[12] = -(right + left) / width;
        e[13] = -(top + bottom) / height;
        e[14] = -(far + near) / depth;
        e[15] = 1;

        return matrix;
    }

    static lookAt(eye, target, up) {
        const matrix = new Matrix4();
        
        const zAxis = Vector3.subtract(eye, target).normalize();
        const xAxis = Vector3.cross(up, zAxis).normalize();
        const yAxis = Vector3.cross(zAxis, xAxis);

        const e = matrix.elements;
        e[0] = xAxis.x;
        e[1] = yAxis.x;
        e[2] = zAxis.x;
        e[3] = 0;

        e[4] = xAxis.y;
        e[5] = yAxis.y;
        e[6] = zAxis.y;
        e[7] = 0;

        e[8] = xAxis.z;
        e[9] = yAxis.z;
        e[10] = zAxis.z;
        e[11] = 0;

        e[12] = -Vector3.dot(xAxis, eye);
        e[13] = -Vector3.dot(yAxis, eye);
        e[14] = -Vector3.dot(zAxis, eye);
        e[15] = 1;

        return matrix;
    }

    static translate(x, y, z) {
        const matrix = new Matrix4();
        const e = matrix.elements;
        e[12] = x;
        e[13] = y;
        e[14] = z;
        return matrix;
    }

    static rotateX(angle) {
        const matrix = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = matrix.elements;
        
        e[5] = c;
        e[6] = s;
        e[9] = -s;
        e[10] = c;
        
        return matrix;
    }

    static rotateY(angle) {
        const matrix = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = matrix.elements;
        
        e[0] = c;
        e[2] = -s;
        e[8] = s;
        e[10] = c;
        
        return matrix;
    }

    static rotateZ(angle) {
        const matrix = new Matrix4();
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const e = matrix.elements;
        
        e[0] = c;
        e[1] = s;
        e[4] = -s;
        e[5] = c;
        
        return matrix;
    }

    static scale(x, y, z) {
        const matrix = new Matrix4();
        const e = matrix.elements;
        e[0] = x;
        e[5] = y;
        e[10] = z;
        return matrix;
    }

    multiply(other) {
        const result = new Matrix4();
        const a = this.elements;
        const b = other.elements;
        const c = result.elements;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                c[i * 4 + j] = 
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }

        return result;
    }

    clone() {
        const matrix = new Matrix4();
        matrix.elements.set(this.elements);
        return matrix;
    }
}
