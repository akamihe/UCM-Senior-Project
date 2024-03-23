package ucmo.senior_project.domain.gametypes;

import java.util.ArrayList;
import java.util.List;

public class BattleshipBoard {
    public final static byte UP = 0, LEFT = 1, DOWN = 2, RIGHT = 3;
    public static final byte WIDTH = 10;
    public static final byte HEIGHT = 10;

    /*
        0000 0000 UNSHOT, only water
        0000 0001 SHOT TAKEN, only water
        0000 0010 SHIP, id 1
        0000 0100 SHIP, id 2
        0000 1000 SHIP, id 3

        0000 0101 SHIP, id 2 ship, was shot
     */
    public static final byte OCEAN = 0;
    public static final byte SHOT_REFERENCE = 1;
    public static final byte SHIP_DIVISOR = 2;

    private byte newShipId = 2; //start at 2, shift by 1.

    private byte[] board = new byte[WIDTH * HEIGHT];

    private List<Battleship> ships = new ArrayList<>();


    public static int convertToAddress(byte x, byte y) {
        return x * WIDTH + y;
    }
    public byte getLocationValue(byte x, byte y) {
        return this.board[convertToAddress(x, y)];
    }
    public byte getLocationId(byte x, byte y) {
        byte data = this.getLocationValue(x, y);

        return data % SHIP_DIVISOR == 1 ? (byte)(data - SHOT_REFERENCE) : data;
    }
    public boolean isAreaAllWater(byte x, byte y, byte angle, byte length) {
        byte localX = x;
        byte localY = y;
        for(int i = 0; i < length; i++) {
            if(!isLocationWaterOnly(localX, localY)) {
                return false;
            }
            switch (angle) {
                case DOWN:
                    localY++;
                    break;
                case UP:
                    localY--;
                    break;
                case LEFT:
                    localX--;
                    break;
                case RIGHT:
                    localX++;
                    break;
            }
        }
        return true;
    }
    public boolean setupShip(byte x, byte y, byte angle, byte length) {
        switch (angle) {
            case DOWN:
                if (x - length < 0) {
                    return false;
                }
                break;
            case UP:
                if (x + length >= WIDTH) {
                    return false;
                }
                break;
            case LEFT:
                if (y - length < 0) {
                    return false;
                }
                break;
            case RIGHT:
                if (x + length >= HEIGHT) {
                    return false;
                }
                break;
        }
        if(!isAreaAllWater(x, y, angle, length)) {
            return false;
        }
        ships.add(new Battleship(this.newShipId, x, y, angle, length));
        newShipId <<= 1; //byte shift, powers of 2 for entity(ship) id.
        return true;
    }
    public void shotLocation(byte x, byte y) {
        int location = convertToAddress(x, y);
        if (this.board[location] % SHIP_DIVISOR == 0) {
            this.board[location] += SHOT_REFERENCE;
        }
    }
    public boolean isLocationShot(byte x, byte y) {
        return this.board[convertToAddress(x, y)] % SHIP_DIVISOR == SHOT_REFERENCE;
    }
    public boolean isLocationWaterOnly(byte x, byte y) {
        return this.getLocationId(x, y) == OCEAN;
    }
    public void setLocation(byte x, byte y, byte id) {
        this.board[convertToAddress(x, y)] = id;
    }
    public class Battleship {
        private byte ship_id, x, y, angle, length;

        public Battleship(byte ship_id, byte x, byte y, byte angle, byte length) {
            this.ship_id = ship_id;
            this.x = x;
            this.y = y;
            this.angle =  angle;
            this.length = length;
            byte localX = x;
            byte localY = y;
            for(int i = 0; i < length; i++) {
                switch (angle) {
                    case DOWN:
                        localY++;
                        break;
                    case UP:
                        localY--;
                        break;
                    case LEFT:
                        localX--;
                        break;
                    case RIGHT:
                        localX++;
                        break;
                }
                setLocation(localX, localY, ship_id);
            }
        }

        public boolean isShipDestroyed() {
            byte localX = x;
            byte localY = y;
            for(int i = 0; i < length; i++) {
                if(!isLocationShot(localX, localY)) {
                    return false;
                }
                switch (angle) {
                    case DOWN:
                        localY++;
                        break;
                    case UP:
                        localY--;
                        break;
                    case LEFT:
                        localX--;
                        break;
                    case RIGHT:
                        localX++;
                        break;
                }
            }
            return true;
        }
    }
}
