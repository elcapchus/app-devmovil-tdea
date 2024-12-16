import { Component, OnInit } from '@angular/core';
import { User } from "../models/user.model";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  user: User = {
    email: '',
    companyname: '',
    companytype: '',
    website: '',
    password: '',
    agree: false,
  };

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {}

  async register(user: User) {
    if (this.formValidation()) {
      let loader = await this.loadingCtrl.create({
        message: "Espere por favor..."
      });
      await loader.present();

      try {
        // Registrar al usuario en Firebase Authentication
        const data = await this.afAuth.createUserWithEmailAndPassword(user.email, user.password);

        // Guardar datos adicionales en Firestore
        await this.firestore.collection('USUARIOS').doc(data.user?.uid).set({
          email: user.email,
          companyname: user.companyname,
          companytype: user.companytype,
          website: user.website,
          agree: user.agree, // Guardar que aceptó los términos
          createdAt: new Date(),
        });

        console.log("Usuario registrado con UID:", data.user?.uid);
        this.navCtrl.navigateRoot("home");
        this.showToast("Registro exitoso. Bienvenido!");

      } catch (error: any) {
        console.error("Error al registrarse:", error);
        this.showToast("Error al registrarse: " + error.message);
      }

      await loader.dismiss();
    }
  }

  formValidation() {
    if (!this.user.email) {
      this.showToast("Ingrese un email");
      return false;
    }
    if (!this.user.password) {
      this.showToast("Ingrese una contraseña");
      return false;
    }
    if (!this.user.companyname) {
      this.showToast("Ingrese el nombre de la compañía");
      return false;
    }
    if (!this.user.companytype) {
      this.showToast("Seleccione el tipo de compañía");
      return false;
    }
    if (!this.user.website) {
      this.showToast("Ingrese el sitio web de la compañía");
      return false;
    }
    if (!this.user.agree) {
      this.showToast("Debe aceptar los términos y condiciones");
      return false;
    }
    return true;
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 2000,
    }).then(toastData => toastData.present());
  }
}
