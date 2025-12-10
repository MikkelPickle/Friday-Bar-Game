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
        const storedValue = await AsyncStorage.getItem('playerStudy');
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
      listItemContainerStyle={styles.itemContainer}
      selectedItemContainerStyle={styles.selectedItemContainer}
      listItemLabelStyle={styles.itemLabel}
      textStyle={styles.dropdownText}
      itemSeparator={true}
      itemSeparatorStyle={{backgroundColor: 'rgba(0, 0, 0, 0.1)'}}
      />
    </View>
  );
};

export default FieldOfStudyDropdown;

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
  },

  dropdown: {
    borderRadius: 20,
    alignContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    width: "85%",
    height: 75,
    borderColor: '#ec2dc5ff',
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 30,
  },

  dropdownContainer: {
    marginTop: 20,
    borderRadius: 20,
    //top corners should also be rounded
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 3,
    borderColor: '#ec2dc5ff',
    backgroundColor: '#FFF0F0',
    width: "85%",
    maxHeight: SCREEN_HEIGHT * 0.35,
  },

  dropdownText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  itemContainer: {
    paddingHorizontal: 10,
    height: 50,
  },

  itemLabel: {
    textAlign: 'left',
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  selectedItemContainer: {
    backgroundColor: //light blue
    'rgba(110, 194, 246, 0.4)',
  }
});

