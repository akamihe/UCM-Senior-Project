package ucmo.senior_project.resource.game.types;


import lombok.Data;
import ucmo.senior_project.domain.gametypes.Sudoku;
import ucmo.senior_project.resource.game.GameData;

@Data
public class SudokuData implements GameData {
    private boolean isSolved = false;
    private long solvedAt = 0;
    private long timeRemaining = 0;
    private int[][] grid;
    private int[][] complete;

    public SudokuData() {
        this.grid = new int[9][9];
        this.complete = new int[9][9];

        this.generate(0, 0);
        this.grid = copy(this.complete);
        this.hideCells();
    }
    public SudokuData(int[][] arr) {
        this.complete = arr;
        this.grid = copy(arr);
        this.hideCells();
    }
    public SudokuData createCopy() {
        return new SudokuData(this.complete);
    }
    private int[][] copy(int[][] arr) {
        int[][] newArr = new int[9][9];

        for (int i = 0; i < 9; i++)
            for (int j = 0; j < 9; j++)
                newArr[i][j] = arr[i][j];

        return newArr;
    }

    private int countSolutions(int[][] grid) {
        int numSolutions = 0;

        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (grid[i][j] == 0) {
                    for (int num = 1; num <= 9; num++) {
                        if (this.isValidCell(grid, i, j, num)) {
                            grid[i][j] = num;
                            numSolutions += this.countSolutions(grid);
                            grid[i][j] = 0;
                        }
                    }

                    return numSolutions;
                }
            }
        }

        return 1;
    }

    private boolean generate(int row, int col) {
        if (col == 9) {
            col = 0;
            row++;
        }

        if (row == 9)
            return true;

        int[] values = { 1, 2, 3, 4, 5, 6, 7, 8, 9 };
        shuffle(values);

        for (int value : values) {
            this.complete[row][col] = value;

            if (this.isValidCell(this.complete, row, col, value))
                if (this.generate(row, col + 1))
                    return true;
        }

        this.complete[row][col] = 0;
        return false;
    }

    private void hideCells() {
        int numCellsToHide = 4;
        int attempts = 0; // max amount of attempts to prevent an infinite loop

        while (attempts < 350 && numCellsToHide > 0) {
            int row = (int)(Math.random() * 9);
            int col = (int)(Math.random() * 9);

            if (this.grid[row][col] != 0) {
                int removed = this.grid[row][col];

                this.grid[row][col] = 0;

                // there must be only one unique solution to a valid Sudoku Puzzle
                if (this.countSolutions(copy(this.grid)) == 1)
                    numCellsToHide--;
                else
                    this.grid[row][col] = removed;
            }

            attempts++;
        }
    }

    private boolean isValidCell(int[][] grid, int row, int col, int num) {
        for (int i = 0; i < 9; i++)
            // check for duplicates in row and column
            if ((grid[row][i] == num && i != col) || (grid[i][col] == num && i != row))
                return false;

        // check duplicates in subgrid
        int subgridRow = row / 3 * 3;
        int subgridCol = col / 3 * 3;

        for (int i = subgridRow; i < subgridRow + 3; i++)
            for (int j = subgridCol; j < subgridCol + 3; j++)
                if (grid[i][j] == num && i != row && j != col)
                    return false;

        return true;
    }

    private void shuffle(int[] arr) {
        for (int i = arr.length - 1; i > 0; i--) {
            int other = (int)(Math.random() * (i + 1));
            int temp = arr[i];
            arr[i] = arr[other];
            arr[other] = temp;
        }
    }

    public int[][] getGrid() {
        return grid;
    }

    public void setGrid(int[][] grid) {
        this.grid = grid;
    }
    public void setGridAt(int x, int y, int value) {
        this.grid[x][y] = value;
    }
    public boolean checkSolved(long timeElapsed) {
        this.timeRemaining = Sudoku.TIME_FRAME_GAME - timeElapsed;
        if(isSolved) {
            return true;
        }
        for(int x = 0; x < grid.length; x++) {
            for(int y = 0; y < grid.length; y++) {
                if(grid[x][y] != complete[x][y]) {
                    isSolved = false;
                    return false;
                }
            }
        }
        this.solvedAt = timeElapsed;
        this.isSolved = true;
        return true;
    }
    public int[][] getComplete() {
        return complete;
    }

    public void setComplete(int[][] complete) {
        this.complete = complete;
    }
}
