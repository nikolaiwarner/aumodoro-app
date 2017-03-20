import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import Firestack from 'react-native-firestack'

const configurationOptions = {
  debug: true
}
const firestack = new Firestack(configurationOptions)

export default class App extends React.Component {
  constructor (props) {
    super(props)

    firestack.on('debug', msg => console.log('Received debug message', msg))
  }

  componentDidMount () {
  }

  _signIn () {
  }

  render () {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this._post.bind(this, 'hello')}>
          <Text>Post</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
