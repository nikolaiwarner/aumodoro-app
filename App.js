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
    // this.firestack.database.setPersistence(true)

    this.state = {
      postStatus: 'Waiting...',
      currentFocusTimeRemainingString: ''
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
        this._userIsReady(evt.user)
      }
    }).then(() => console.log('Listening for authentication changes'))

    setInterval(() => {
      this._updateCurrentFocusTimeRemaining()
    }, 1000)
  }

  componentWillUnmount () {
    this.firestack.auth.unlistenForAuth()
  }

  _signIn () {
    return this.firestack.auth.signInWithEmail('nickwarner@gmail.com', 'password')
      .then((user) => {
        this._userIsReady(user)
      })
      .catch((err) => {
        console.log('User signin error', err)
      })
  }

  _userIsReady (user) {
    console.log('User details', user)
    this.databaseRef = this.firestack.database.ref(user.uid)
    this.databaseRef.keepSynced(true)
    this.setState({currentUser: user})
    this._getPoms()
  }

  _pathToUserData (userId) {
    userId = userId || this.state.currentUser.uid
    return `users/${userId}`
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
      let difference = moment(this.state.currentFocus.endsAt).diff(moment())
      let remaining = moment.duration(difference, 'milliseconds')
      this.setState({currentFocusTimeRemainingString: `${remaining.minutes()}:${remaining.seconds()}`})
    }
  }

  _getPoms () {
    console.log('_getPoms')
    this.firestack.database.ref('poms').orderByChild('timestamp').limitToLast(30).once('userId').then((snapshot) => {
      console.log(snapshot)
    })
  }

  _startPom () {
    console.log(this.state.currentUser)
    this.firestack.database.ref(this._pathToUserData() + '/poms').push().then((res) => {
      this.firestack.ServerValue.then((map) => {
        let length = 1500000 // 25min
        let startsAt = moment().format()
        let endsAt = moment(endsAt).add(length, 'milliseconds').format()
        const data = {
          createdAt: map.TIMESTAMP,
          ended: false,
          endsAt: endsAt,
          length: length,
          id: res.key,
          startsAt: startsAt,
          userId: this.state.currentUser.uid
        }
        let updates = {}
        updates['/focus/' + res.key] = data
        this.firestack.database.ref().update(updates).then(() => {
          this.setState({
            currentFocus: data
          })
          this._getPoms()
        }).catch(() => {
          this.setState({status: 'Something went wrong!!!'})
        })
      })
    })
  }

  _stopPom () {
    if (this.state.currentFocus) {

    }
  }

  render () {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this._startPom.bind(this)}>
          <Text>Start</Text>
        </TouchableOpacity>
        <Text>{this.state.currentFocusTimeRemainingString}</Text>
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
