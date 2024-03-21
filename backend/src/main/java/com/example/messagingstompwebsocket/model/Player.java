package com.example.messagingstompwebsocket.model;

public class Player {
    private String id;
    private boolean isHost;
    private String name;
    private int pts;
    private int ptsAwarded;
    private boolean done;
    private boolean isDisconnected;

    public Player(String id, boolean isHost, String name, int pts, int ptsAwarded, boolean done) {
        this.id = id;
        this.isHost = isHost;
        this.name = name;
        this.pts = pts;
        this.ptsAwarded = ptsAwarded;
        this.done = done;
        this.isDisconnected = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean getIsHost() {
        return this.isHost;
    }

    public void setIsHost(boolean isHost) {
        this.isHost = isHost;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPts() {
        return pts;
    }

    public void setPts(int pts) {
        this.pts = pts;
    }

    public int getPtsAwarded() {
        return ptsAwarded;
    }

    public void setPtsAwarded(int ptsAwarded) {
        this.ptsAwarded = ptsAwarded;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public boolean getIsDisconnected() {
        return isDisconnected;
    }

    public void setIsDisconnected(boolean isDisconnected) {
        this.isDisconnected = isDisconnected;
    }
}
