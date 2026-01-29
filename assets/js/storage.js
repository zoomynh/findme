export const storage = {
  getStage() {
    return localStorage.getItem("stage") || null;
  },
  setStage(id) {
    localStorage.setItem("stage", id);
  },
  getFlags() {
    try { return JSON.parse(localStorage.getItem("flags") || "{}"); }
    catch { return {}; }
  },
  setFlag(key, value = true) {
    const flags = this.getFlags();
    flags[key] = value;
    localStorage.setItem("flags", JSON.stringify(flags));
  }
};
