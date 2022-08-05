import React, { Component, Fragment } from 'react'
import styles from './index.css'

const formatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
})
class MultibancoTransactionAuthApp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scriptLoaded: false,
      loading: false,
    }

    this.divContainer = React.createRef()
  }

  componentWillMount = () => {
    this.injectScript(
      'google-recaptcha-v2',
      'https://recaptcha.net/recaptcha/api.js?render=explicit',
      this.handleOnLoad
    )
  }

  componentDidMount() {
    // In case you want to remove payment loading in order to show an UI.
    $(window).trigger('removePaymentLoading.vtex')
  }

  respondTransaction = (status) => {
    $(window).trigger('transactionValidation.vtex', [status])
  }

  handleOnLoad = () => {
    this.setState({ scriptLoaded: true })
    grecaptcha.ready(() => {
      grecaptcha.render(this.divContainer.current, {
        sitekey: '------>REPATCHA_V2_SITE_KEY<------', //Replace with site key
        theme: 'dark',
        callback: this.onVerify,
      })
    })
  }

  onVerify = (e) => {
    const parsedPayload = JSON.parse(this.props.appPayload)
    this.setState({ loading: true })

    fetch(parsedPayload.approvePaymentUrl).then(() => {
      this.respondTransaction(true)
    })
  }

  cancelTransaction = () => {
    const parsedPayload = JSON.parse(this.props.appPayload)
    this.setState({ loading: true })

    fetch(parsedPayload.denyPaymentUrl).then(() => {
      this.respondTransaction(false)
    })
  }

  confirmTransation = () => {
    const parsedPayload = JSON.parse(this.props.appPayload)
    this.setState({ loading: true })

    fetch(parsedPayload.approvePaymentUrl).then(() => {
      this.respondTransaction(true)
    })
  }

  injectScript = (id, src, onLoad) => {
    if (document.getElementById(id)) {
      return
    }

    const head = document.getElementsByTagName('head')[0]

    const js = document.createElement('script')
    js.id = id
    js.src = src
    js.async = true
    js.defer = true
    js.onload = onLoad

    head.appendChild(js)
  }

  render() {
    const { scriptLoaded, loading } = this.state

    console.log("'Hello world ", scriptLoaded)

    console.log(this.props.appPayload)

    const { value, reference } = JSON.parse(this.props.appPayload)

    console.log(value, reference)

    return (
      <div className={styles.wrapper}>
        {scriptLoaded && !loading ? (
          <Fragment>
            <img
              className={styles.logo}
              src="https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/multibanco.svg"></img>
            <div>
              <h5 className={styles.title}>Reference</h5>
              <p className={styles.desc}>{reference || ''}</p>
            </div>
            <div>
              <h5 className={styles.title}>value</h5>
              <p className={styles.desc}>{formatter.format(value / 100)}</p>
            </div>
          </Fragment>
        ) : (
          <h2>Carregando...</h2>
        )}

        {!loading && (
          <button
            id="payment-app-cancel"
            className={styles.buttonDanger}
            onClick={this.confirmTransation}>
            Fechar
          </button>
        )}
      </div>
    )
  }
}

export default MultibancoTransactionAuthApp
