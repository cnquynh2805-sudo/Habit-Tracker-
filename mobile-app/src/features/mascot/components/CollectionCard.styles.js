import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  animationContainer: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },

  animation: {
    width: 150,
    height: 100,
  },

  name: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 12,
    fontSize: 14,
    color: "#333",
  },

  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "100%",
  },

  equippedButton: {
    backgroundColor: "#c0c0c0",
  },

  unequippedButton: {
    backgroundColor: "#4B8B6B",
  },

  buttonText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },

  equippedButtonText: {
    color: "#666",
  },

  unequippedButtonText: {
    color: "#fff",
  },
});

export default styles;