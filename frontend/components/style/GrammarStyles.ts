import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 42,
  },
  filterPicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    width: 100,
    height: 42,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  item: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  itemTitle: { fontWeight: 'bold', fontSize: 16 },
  level: { color: '#6B7280', fontSize: 14 },
  itemDesc: { fontSize: 14, color: '#555', marginTop: 6 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#F87171',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#6366F1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  back: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
    alignSelf: 'center'
    
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 10,
    height: 42,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
   button: {
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 6,
  }
});
