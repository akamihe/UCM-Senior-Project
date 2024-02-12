import { Form } from 'react-bootstrap';

const style = {
    container: {
        display: "flex",
        alignItems: "center",
        padding: "8px 12px",
        border: "1px solid #ced4da",
        borderRadius: 6
    },
    input: {
        border: "none",
        padding: 0,
        boxShadow: "none"
    }
}

const InputWithAdornment = ({adornment, adornmentPlacement, ...rest}) => {
    return (
        <div
            className="bs-shadow"
            style={{
                ...style.container,
                flexDirection: adornmentPlacement === "right" ? "row-reverse" : "row"
            }}
        >
            <span className="text-muted">{adornment}</span>
            <Form.Control
                {...rest}
                style={{
                    ...style.input,
                    margin: adornmentPlacement === "right" ? "0 8px 0 0" : "0 0 0 8px",
                    ...rest.style
                }}
            />
        </div>
    )
}

export default InputWithAdornment;