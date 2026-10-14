import "./css/bar-editor.css";
import { useSelector, useDispatch } from "react-redux";
import { useCreateBarMutation, useUpdateBarMutation } from "../api/barsApi";
import { selectActiveBar, setActiveBar, clearActiveBar } from "../model/barsSlice";
import CustomButton from "@/components/ui/custom-buttons/CustomButton";

function BarEditor() {
  const activeBar = useSelector(selectActiveBar);
  const dispatch = useDispatch();

  const [createBar, { isLoading: isCreating }] = useCreateBarMutation();
  const [updateBar, { isLoading: isUpdating }] = useUpdateBarMutation();
  const isSaving = isCreating || isUpdating;

  const handleSubmit = async () => {
    const text = activeBar.text.trim();
    if (!text || isSaving) return;

    try {
      if (activeBar.id) {
        await updateBar({ id: activeBar.id, text }).unwrap();
      } else {
        await createBar({ text }).unwrap();
      }
      dispatch(clearActiveBar());
    } catch {
      // Keep the draft so the user can retry; the listener shows the error.
    }
  };

  // Enter submits, Shift+Enter starts the second line of the bar.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getButtonText = () => {
    if (isCreating) return "Scoring...";
    if (isUpdating) return "Rescoring...";
    return activeBar.id ? "Update bar" : "Drop bar";
  };

  return (
    <div className="bar-editor g-bg">
      <textarea
        className="bar-editor-input g-fg"
        rows={2}
        maxLength={500}
        onChange={(e) => dispatch(setActiveBar({ text: e.target.value }))}
        onKeyDown={handleKeyDown}
        value={activeBar.text || ""}
        placeholder="Write a bar... (Shift+Enter for a new line)"
        aria-label="Bar"
      />
      <div className="bar-editor-actions">
        <CustomButton text={getButtonText()} onClick={handleSubmit} disabled={isSaving} />
        <CustomButton
          text="Cancel"
          variant="warning"
          onClick={() => dispatch(clearActiveBar())}
          icon="cancel"
          disabled={isSaving}
        />
      </div>
    </div>
  );
}

export default BarEditor;
