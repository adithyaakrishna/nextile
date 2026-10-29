export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

export function isNativeShareAvailable(text: string): boolean {
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  return isTouch && typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ text }));
}

// Touch devices get the native share sheet; desktops copy, which is what desktop players expect
export async function shareResult(text: string): Promise<ShareOutcome> {
  if (isNativeShareAvailable(text)) {
    try {
      await navigator.share({ text }); // the link rides inside text: some targets drop or duplicate a separate url
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return legacyCopy(text) ? "copied" : "failed";
  }
}
