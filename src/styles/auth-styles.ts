import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  fieldset: {
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "5px",
    width: "300px",
    margin: "0 auto",
  },
  legend: {
    fontSize: "20px",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  input: {
    display: "block",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100%",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginBottom: "10px",
  },
  success: {
    color: "green",
    fontSize: "12px",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  deleteAccountButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#dc3545",
    color: "#fff",
    cursor: "pointer",
  },
};

export default styles;
