const style = {
  instanceWindow: { width: "50%", height: "50%", flexShrink: 0, border: "1px solid #0002" },
  instanceContentContainer: { transformOrigin: "top", paddingTop: 8 }
};

export default function MultiScreens({ instances, scale }) {
  return (
    <>
      {instances.map((instance, idx) => (
        <div style={style.instanceWindow} key={idx}>
          <div style={{ scale: scale || 0.6, ...style.instanceContentContainer }}>
            {instance}
          </div>
        </div>
      ))}
    </>
  )
}