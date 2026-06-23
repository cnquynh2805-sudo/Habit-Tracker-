import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#1C2E24", 
    padding: 24, 
    justifyContent: "center" 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#FFF", 
    marginBottom: 8, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#7C8B82", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  list: { 
    flex: 1 
  },
  habitRow: { 
    backgroundColor: "#2A3E34", 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 12 
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitName: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#FFF" 
  },
  habitProgress: { 
    fontSize: 12, 
    color: "#7C8B82", 
    marginTop: 4 
  },
  checkButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: "#3B604D", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  checkText: { 
    color: "#FFF", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  emptyText: { 
    color: "#FFF", 
    textAlign: "center", 
    marginTop: 40, 
    fontSize: 16 
  },
  closeButton: { 
    backgroundColor: "#C84B31", 
    padding: 14, 
    borderRadius: 12, 
    alignItems: "center", 
    marginTop: 16 
  },
  closeText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 16 
  }
});