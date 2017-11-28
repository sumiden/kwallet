import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, NavParams,AlertController, LoadingController, Loading } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Stripe } from '@ionic-native/stripe';

/**
 * Generated class for the ChargePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-charge',
  templateUrl: 'charge.html',
})
export class ChargePage {
  number: string
  expMonth: string
  expYear: string
  cvc: string
  amount: string

  cardinfo: any = {
    number: this.number,
    expMonth: this.expMonth,
    expYear: this.expYear,
    cvc: this.cvc
  };

  loading: Loading;
  myAddress = "";
  masterAddress = "1Zz3rAJ5mBTQepG5uJbkuvF79f3FaKvmyR7f3r";
  

constructor(public navCtrl: NavController, public alertCtrl: AlertController, public viewCtrl: ViewController,
  public navParams: NavParams, public stripe: Stripe, public http: Http, private loadingCtrl: LoadingController) {
    this.getProfile();    
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChargePage');
  }

  creditRegister() {
    this.showLoading();    
    this.stripe.setPublishableKey('pk_test_ZR1Wpiz87qoXuxvy32h9XLtP');
    this.stripe.createCardToken(this.cardinfo)
      .then(token => {
        var myToken = token.id;
        this.pay(myToken);
        console.log(token);
      })
      .catch(error => {
        let alert = this.alertCtrl.create({
          title: 'error',
          subTitle: '失敗',
          buttons: ['OK']
          });
          this.loading.dismiss();     
          this.viewCtrl.dismiss();        
        alert.present();
        console.error(error);
      });
  }

  pay(myToken) {
    var headers = new Headers();
    headers.append("Content-Type", "application/json");
    var options = new RequestOptions({ "headers": headers });
    var body = {
      amount: this.amount,
      currency: "JPY",
      description: "Example charge",
      source: myToken
    }
    this.http.post('https://demofunction001.azurewebsites.net/api/GenericWebhookJS4?code=kRXr4sOfrMDWEzynsDF6WRolC9W2VfofL/OKiPl/xDW4XMr8ahv2oA==&clientId=default', body, options)
    .map(response => response.json())
    .subscribe(res => {
      console.log(res)
        let alert = this.alertCtrl.create({
          title: 'success',
          subTitle: 'チャージ完了',
          buttons: ['OK']
          });
          this.send_marucoin();
          this.loading.dismiss();      
          this.viewCtrl.dismiss();
        alert.present();
     }, err => {
      console.log(err);// Error getting the data
      let alert = this.alertCtrl.create({
        title: 'error',
        subTitle: '失敗',
        buttons: ['OK']
        });
        this.loading.dismiss();     
        this.viewCtrl.dismiss();        
      alert.present();
    });
  }

    //ローディング表示
    showLoading() {
      if(this.loading){
        this.loading.dismiss();
      }
      this.loading = this.loadingCtrl.create({
        content: 'now loading',
        dismissOnPageChange: true
      });
      this.loading.present();
    }

      //マルコインの送信
  send_marucoin(){
    var headers = new Headers();
    headers.append('Content-Type', 'application/json' );
    headers.append('Authorization', 'Basic bXVsdGljaGFpbnJwYzoyR2tXWjlnMjhYTDNBUHpXcGJVM0p4TmlYSHBSRWRmVTRmWTl1YXdYOWpoWg==');
    var options = new RequestOptions({ "headers": headers });
    var body = {
     "method"  : "sendfromaddress",
     "params"  : [this.masterAddress, this.myAddress, {"marucoin":Number(this.amount)}],
     "id"    : 0,
     "chain_name": "chain1"
    }
    this.http.post("https://yqqc8r7eeh.execute-api.us-west-2.amazonaws.com/prod/ab", body, options)
      .map(response => response.json())
      .subscribe(result => {
        console.log("data: "+JSON.stringify(result));
       }, error => {
        console.log(error);// Error getting the data
      });
  }
  
  //情報取得
  public getProfile() {
    var user = firebase.auth().currentUser;
    this.myAddress = user.photoURL;
  }

  public return(){
    this.viewCtrl.dismiss();            
  }
}
