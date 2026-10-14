import "./custom-button.css";

const CustomButton = ({
  text = "Submit",
  variant = "accent",
  onClick = () => {},
  icon = "send",
  disabled = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          "--button-text": `"${text}"`,
          "--button-bg": "var(--accent-warning)",
          "--button-shadow": "rgba(255, 140, 0, 0.3)",
        };
      case "danger":
        return {
          "--button-text": `"${text}"`,
          "--button-bg": "var(--accent-danger)",
          "--button-shadow": "rgba(255, 71, 87, 0.3)",
        };
      default:
        return {
          "--button-text": `"${text}"`,
          "--button-bg": "var(--accent)",
          "--button-shadow": "var(--accent-glass)",
        };
    }
  };

  const renderIcon = () => {
    if (icon === "cancel") {
      return (
        <svg className="svgIcon" viewBox="0 0 384 512">
          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
        </svg>
      );
    }

    return (
      <svg className="svgIcon" viewBox="0 0 384 512">
        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
      </svg>
    );
  };

  return (
    <button
      className="custom-button"
      style={getVariantStyles()}
      onClick={onClick}
      disabled={disabled}
    >
      {renderIcon()}
    </button>
  );
};

export default CustomButton;
