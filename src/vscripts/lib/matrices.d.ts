declare type MatrixData = number[][];
declare type MatrixSpecialType = "I" | "R" | "S" | "T";

/**
 * Matrix class.
 * @param args defines the Matrix. Options possible:
 * 	- `Matrix(2)`: Creates a 2x2 Matrix with 0s
 *	- `Matrix(2,4)`: Creates a 2x4 Matrix with 0s
 *	- `Matrix([1,2,3])`: Creates a 1x3 Matrix with the table as row
 *	- `Matrix([1,2,3], [4,5,6])`: Creates a 2x3 Matrix with the tables as rows
 *	- `Matrix(2, [1,2], [3,4,5])`: Creates a 2x2 Matrix with tables as rows. Bigger rows shortened, otherwise filled with 0
 *	- `Matrix(2, 4, [...])`: Creates a 2x4 Matrix with tables as rows. Bigger rows shortened, otherwise filled with 0
 *	- `Matrix([1,1,1],[2,2,2],[3,3,3],[4,4,4])`: Creates a 4x3 Matrix with tables as rows
 *	- `Matrix("I", 4)`: Creates a 4x4 Matrix with 0s and diagonal 1s. Default size: 2x2
 *	- `Matrix("R", 40)`: Creates a 3x3 homogeneous matrix with rotation degree of 40°. Default: 0°
 *	- `Matrix("S", [2,3])`: Creates a 3x3 homogeneous matrix with scaling of 2*x, 3*y. Default: {1,1}
 *	- `Matrix("T", [10,2])`: Creates a 3x3 homogeneous matrix with translation of x+10, y+2. Default: {0,0}
 */
declare function Matrix(this: void, ...args: MatrixArguments): Matrix;
declare type MatrixArguments =
	| [number]
	| [number, number]
	| [number, ...number[][]]
	| [number, number, ...number[][]]
	| number[][]
	| [MatrixSpecialType]
	| ["I" | "R", number]
	| ["S" | "T", number[]];

/**
 * Matrix Class
 */
declare type Matrix = __NumberLike & {
	data: MatrixData;
	/**
	 * Overloaded +. Adds vectors together.
	 *
	 * @both
	 */
	__add(b: Matrix): Matrix;
	/**
	 * Overloaded /. Divides vectors.
	 *
	 * @both
	 */
	__len(): number;
	/**
	 * Overloaded * returns the vectors multiplied together. Can also be used to
	 * multiply with scalars.
	 *
	 * @both
	 */
	__mul(b: Matrix | number): Matrix;
	/**
	 * Overloaded -. Subtracts vectors.
	 *
	 * @both
	 */
	__sub(b: Matrix): Matrix;
	/**
	 * Overloaded .. Converts vectors to strings.
	 *
	 * @both
	 */
	__tostring(): string;
	/**
	 * Calculates the determinant of the matrix.
	 * Returns undefined, if matrix is not quadratic, or bigger than 3x3.
	 */
	Determinant(): number | undefined;
};
