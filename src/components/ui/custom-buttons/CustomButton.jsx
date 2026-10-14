import "./custom-button.css";

const CustomButton = ({
  text = "Submit",
  variant = "accent",
  onClick = () => {},
  icon = "send",
  disabled = false,
}) => {
  const renderIcon = () => {
    if (icon === "cancel") {
      return (
        <svg className="svgIcon" viewBox="0 0 384 512" aria-hidden="true">
          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
        </svg>
      );
    }

    return (
      <svg className="svgIcon" viewBox="0 0 384 512" aria-hidden="true">
        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"></path>
      </svg>
    );
  };

  return (
    <button
      type="button"
      className="custom-button"
      data-variant={variant}
      onClick={onClick}
      disabled={disabled}
    >
      {renderIcon()}
      <span className="custom-button-label">{text}</span>
    </button>
  );
};

export default CustomButton;
