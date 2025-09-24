import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import JoinGameButton from '../buttons/JoinGameButton';

describe('JoinGameButton', () => {
  it('renders correctly and responds to press', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<JoinGameButton onPress={onPressMock} />);
    
    const button = getByText("joinGame");
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalled();
  });
});
