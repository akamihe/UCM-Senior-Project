package ucmo.senior_project.resource.game.types;

public class GameDebugObject {
    private double value;
    private String code;

    public GameDebugObject() {
    }

    public GameDebugObject(String code, double value) {
        this.value = value;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }
    public void setCode(String code) {
        this.code = code;
    }
    public String getCode() {
        return this.code;
    }
}
