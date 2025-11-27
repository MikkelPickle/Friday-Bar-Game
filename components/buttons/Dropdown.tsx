import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type FieldOption = {
  label: string;
  value: string;
  emoji: string;
};

interface Props {
  onSelect?: (value: string | null) => void;
}

const STORAGE_KEY = 'student_field_of_study';

const FieldOfStudyDropdown: React.FC<Props> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [items, setItems] = useState<FieldOption[]>([
    { label: 'Computer Science', value: 'cs', emoji: '💻' },
    { label: 'Engineering', value: 'engineering', emoji: '⚙️' },
    { label: 'Business Administration', value: 'business', emoji: '📊' },
    { label: 'Medicine', value: 'medicine', emoji: '🏥' },
    { label: 'Law', value: 'law', emoji: '⚖️' },
    { label: 'Psychology', value: 'psychology', emoji: '🧠' },
    { label: 'Education', value: 'education', emoji: '🎓' },
  ]);

  // Load saved value on mount
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedValue) {
          setValue(storedValue);
          onSelect?.(storedValue);
        }
      } catch (error) {
        console.error("Failed to load field of study:", error);
      }
    };
    loadStoredValue();
  }, []);

  const handleValueChange = async (val: string | null) => {
    onSelect?.(val);
  };

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={value}
        items={items.map(item => ({
          label: `${item.emoji}  ${item.label}`,
          value: item.value,
        }))}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        onChangeValue={handleValueChange}
        placeholder="Select a field of study"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemLabelStyle={styles.itemLabel}
        textStyle={styles.dropdownText}
      />
    </View>
  );
};

export default FieldOfStudyDropdown;

const styles = StyleSheet.create({
  container: {
    marginTop: 5
  },
  dropdown: {
    borderRadius: 20,
    borderWidth: 3,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.09,
    borderColor: '#ff88e8',
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  dropdownContainer: {
    marginTop: 25,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ff88e8', //light gray
    backgroundColor: '#FFF0F0',
    width: SCREEN_WIDTH * 0.9, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  dropdownText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  itemLabel: {
    textAlign: 'left',
    fontSize: 16,
    fontWeight: '600',
    color: '#000', //black
    padding: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#eee'
  },
});
