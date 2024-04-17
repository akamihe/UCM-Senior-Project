
package ucmo.senior_project.domain.gametypes;

public class PictionaryStroke {
    private String tool;
    private double[] points;
    private String color;
    private int strokeWidth;

    public PictionaryStroke(String tool, double[] points, String color, int strokeWidth) {
        this.tool = tool;
        this.points = points;
        this.color = color;
        this.strokeWidth = strokeWidth;
    }

    public String getTool() {
        return tool;
    }

    public void setTool(String tool) {
        this.tool = tool;
    }

    public double[] getPoints() {
        return points;
    }

    public void setPoints(double[] points) {
        this.points = points;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public int getStrokeWidth() {
        return strokeWidth;
    }

    public void setStrokeWidth(int strokeWidth) {
        this.strokeWidth = strokeWidth;
    }
}