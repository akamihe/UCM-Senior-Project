package ucmo.senior_project.resource.game.types;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;

@Data
@NoArgsConstructor
public class BattleshipShip {
    public static final int DIRECTION_UP = 0;
    public static final int DIRECTION_RIGHT = 1;
    public static final int DIRECTION_DOWN = 2;
    public static final int DIRECTION_LEFT = 3;


    private int xCordStart;
    private int yCordStart;
    private int length;
    private int direction;
    private boolean[] hits;

    public BattleshipShip(int x,int y,int length,int direction) {
        this.xCordStart = x;
        this.yCordStart = y;
        this.length = length;
        this.setDirection(direction);
        this.hits = new boolean[length];
    }
    public void rotate() {
        this.direction += 3;
        this.direction %= 4;
        int newY = 4 - (this.xCordStart);
        int newX = this.yCordStart;
        xCordStart = newX;
        yCordStart = newY;
    }

    public void setDirection(int direction) {
        switch(direction) {
            case DIRECTION_UP:
            case DIRECTION_RIGHT:
            case DIRECTION_LEFT:
            case DIRECTION_DOWN:
                this.direction = direction;
                break;
            default:
                throw new RuntimeException("INVALID INPUT");
        }
    }
    public boolean hasHitShip(int x, int y) {
        if(x == xCordStart) {
            if(direction == DIRECTION_UP) {
                int pos = yCordStart-y;
                if(0 <= pos && pos < length) {
                    this.hits[length-1-pos] = true;
                    return true;
                }
                //return (yCordStart - length) <= y && y <= yCordStart;
            } else if (direction == DIRECTION_DOWN) {
                int pos = y-yCordStart;
                if(0 <= pos && pos < length) {
                    this.hits[pos] = true;
                    return true;
                }
            }
        }
        if(y == yCordStart) {
            if(direction == DIRECTION_LEFT) {
                int pos = xCordStart-x;
                if(0 <= pos && pos < length) {
                    this.hits[length-1-pos] = true;
                    return true;
                }
            } else if (direction == DIRECTION_RIGHT) {
                int pos = x-xCordStart;
                if(0 <= pos && pos < length) {
                    this.hits[pos] = true;
                    return true;
                }
            }
        }
        return false;
    }
    public boolean isShipSunk() {
        for(int i = 0; i < this.hits.length; i++) {
            if(!hits[i]) {
                return false;
            }
        }
        return true;
    }
}
