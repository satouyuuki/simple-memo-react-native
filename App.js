import React, { useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuList: {
    backgroundColor: '#f9c2ff',
    height: 75,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fonts: {
    fontSize: 32,
  }
});

const STORAGE_KEY_TODO = 'TODOLIST';
const saveItem = async (item) => {
  try {
    const todoString = JSON.stringify(item);
    await AsyncStorage.setItem(STORAGE_KEY_TODO, todoString);
  } catch (e) {
    console.log(e);
  }
};
const loadItem = async () => {
  try {
    const todoString = await AsyncStorage.getItem(STORAGE_KEY_TODO);
    if (todoString) {
      const todoList = JSON.parse(todoString);
      return todoList;
    }
  } catch (e) {
    console.log(e);
  }
};

const Menu = () => {
  return (
    <View style={styles.menuList}>
      <Text style={styles.fonts}>超シンプルなメモアプリ</Text>
    </View>
  );
}

const TodoItem = ({
  item,
  handlePressItem,
  handleDeleteItem,
}) => {
  const textDecorationLine = item.isCompleted ? 'line-through' : 'none';
  return (
    <View style={styles.flexCenter}>
      <TouchableWithoutFeedback onPress={() => handlePressItem(item)}>
        <View>
          <Text style={[styles.fonts, {textDecorationLine: textDecorationLine}]}>{item.title}</Text>
        </View>
      </TouchableWithoutFeedback>
      <Button
        title="削除"
        color="#DDDDDD"
        onPress={() => handleDeleteItem(item)}
      />
    </View>
  );
};

const App = () => {
  const [text, onChangeText] = React.useState('');
  const [data, setData] = React.useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadItem();
      setData(data);
    };
    fetchData();
  }, []);

  const handlePressItem = async (item) => {
    const newData = data.map((el) => {
      if (el.seq === item.seq) {
        return {
          ...el,
          isCompleted: !item.isCompleted,
        };
      }
      return el;
    });
    // post to db
    await saveItem(newData);
    setData(newData);
  };

  const handleDeleteItem = async (item) => {
    const newData = data.filter((el) => el.seq !== item.seq);
    // post to db
    await saveItem(newData);
    setData(newData);
  };

  const handleAddTo = async (e) => {
    // validation
    if (text === '') return;

    let maxSeq = 0;
    if (data && data.length >= 1) {
      maxSeq = Math.max.apply(
        Math,
        data.map((o) => o.seq)
      );
    }
    const newValue = {
      title: text,
      isCompleted: false,
      seq: maxSeq + 1,
    };
    const newData = data ? [...data, newValue] : [newValue];
    await saveItem(newData);
    setData(newData);
    // data clear
    onChangeText('');
  };

  const renderItem = ({ item }) => {
    return (
      <TodoItem
        item={item}
        handlePressItem={handlePressItem}
        handleDeleteItem={handleDeleteItem}
      />
    );
  };

  return (
    <View>
      <Menu />
      <View style={styles.flexCenter}>
        <TextInput
          style={[styles.fonts, {width: 280}]}
          onChangeText={onChangeText}
          value={text}
          placeholder="add memo..."
        />
        <Button
          title="追加"
          onPress={handleAddTo}
        />
      </View>

      {data && data.length >= 1 && (
        <FlatList data={data} renderItem={renderItem} keyExtractor={data.seq} />
      )}
    </View>
  );
};
export default App;
