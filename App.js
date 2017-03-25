import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import moment from 'moment'

import Firestack from 'react-native-firestack'

const configurationOptions = {
  debug: true
}

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.firestack = new Firestack(configurationOptions)
    this.firestack.on('debug', msg => console.log('Received debug message', msg))

    this.state = {
      postStatus: 'Waiting...',
      currentFocusTimeRemaining: 0
    }
  }

  componentDidMount () {
    this.firestack.auth.listenForAuth((evt) => {
      // evt is the authentication event
      // it contains an `error` key for carrying the
      // error message in case of an error
      // and a `user` key upon successful authentication
      if (!evt.authenticated) {
        // There was an error or there is no user
        console.log(evt.error)
        this._signIn()
      } else {
        // evt.user contains the user details
        console.log('User details', evt.user)
      }
    }).then(() => console.log('Listening for authentication changes'))
  }

  componentWillUnmount () {
    this.firestack.auth.unlistenForAuth()
  }

  _signIn () {
    this.firestack.auth.signInWithEmail('nickwarner@gmail.com', 'password')
      .then((user) => {
        console.log('User successfully logged in', user)
      })
      .catch((err) => {
        console.log('User signin error', err)
      })
  }

  _post () {
    this.firestack.database.ref('messages').push().then((res) => {
      let newPostKey = res.key
      this.firestack.ServerValue.then(map => {
        const postData = {
          timestamp: map.TIMESTAMP,
          text: 'hello',
          puid: newPostKey
        }
        let updates = {}
        updates['/messages/' + newPostKey] = postData
        this.firestack.database.ref().update(updates).then(() => {
          this.setState({
            postStatus: 'Posted! Thank You.',
            postText: ''
          })
        }).catch(() => {
          this.setState({ postStatus: 'Something went wrong!!!' })
        })
      })
    })
  }

  _updateCurrentFocusTimeRemaining () {
    if (this.state.currentFocus) {
      // ....
      // this.setState({currentFocusTimeRemaining: ...})
    }
  }

  _startPom () {
    this.firestack.database.ref('poms').push().then((res) => {
      this.firestack.ServerValue.then(map => {
        const data = {
          ended: false,
          length: 1500000, // 25min
          id: res.key,
          startsAt: map.TIMESTAMP,
          endsAt: map.TIMESTAMP
        }
        let updates = {}
        updates['/focus/' + res.key] = data
        this.firestack.database.ref().update(updates).then(() => {
          this.setState({
            currentFocus: data
          })
        }).catch(() => {
          this.setState({status: 'Something went wrong!!!'})
        })
      })
    })
  }

  render () {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this._startPom.bind(this)}>
          <Text>Start</Text>
        </TouchableOpacity>
        <Text>{this.state.currentFocusTimeRemaining}</Text>
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
