<template>
  <Page class="page">
    <ActionBar class="action-bar" title="CorpoTurismo">
      <NavigationButton text="Go Back" android.systemIcon="ic_menu_back" @tap="$router.push('/home')"/>
    </ActionBar>
    <TabView :selectedIndex="selectedIndex">
      <TabViewItem title="Ventas">

        <GridLayout columns="120, 240" rows="90, 90, *, 50">

          <ListPicker 
            col="0"
            row="0"
            colSpan="2"
            height="100"
            :items="listOfPrices"
            v-model="tiquetPrice" />
            
          <ListPicker 
            col="0"
            row="1"
            height="100"
            :items="listOfNumbers" 
            v-model="amountOfTiquets" />

          <Button 
            col="1" 
            row="1" 
            @tap="createTiquet" 
            height="80" 
            width="240" 
            text="Generar Tiquetes" 
            color="black" 
            class="btn btn-primary"/>

          <ListView col="0" row="2" colSpan="2"  for="tiquet in this.soldTiquets" @itemTap="onItemTap">
              <v-template if="tiquet.type == 'header'">
                <!-- Shows the list item label in the default color and stye. -->
                <GridLayout backgroundColor="#f6f6f6" class="list-group-item p-x-15 p-y-10 text-center" columns="130, 100, 100" rows="auto, auto">
                    <label col="0" row="0" text="Fecha de Venta"></label>
                    <label col="1" row="0" text="Cantidad"></label>
                    <label col="2" row="0" text="Valor"></label>
                </GridLayout>
              </v-template>
              <v-template if="tiquet.type == 'tiquet'">
                <GridLayout class="list-group-item p-x-15 p-y-10" columns="130, 100, 130" rows="auto, auto">
                    <label col="0" class="text-center">{{tiquet.date | moment("DD/MM/YYYY hh:mm")}}</label>
                    <label col="1" :text="tiquet.quantity" class="text-center"></label>
                    <label col="2" class="p-l-20 text-justify">$ {{tiquet.total}}</label>
                </GridLayout>
              </v-template>
          </ListView>

          <Button @tap="onReport" col="0" row="3" colSpan="2" height="50" text="Sincronizar" color="black" class="btn btn-primary"/>

        </GridLayout>  
        
      </TabViewItem>
      <TabViewItem title="Lectura">
        <FlexboxLayout flexDirection="column">
            <Button @tap="onScan" text="Leer Tiquetes" color="black" class="btn btn-primary"/>
            <ListView for="code in this.codes" row="1" colSpan="3" @itemTap="onItemTap" flexGrow="1">
              <v-template>
                <!-- Shows the list item label in the default color and stye. -->
                <GridLayout class="list-group-item p-x-15 p-y-10" columns="130, 80, 140" rows="auto, auto">
                    <Label row="0" class="list-group-item-heading p-t-10 font-weight-bold">{{code.text}}</Label>
                    <Label col="1" class="list-group-item-heading p-t-10 font-weight-bold">{{code.added_at | moment("YYYY/MM/DD")}}</Label>
                    <button col="2" height="40" width="110" :text="stateText(code.validated)" :backgroundColor="stateColor(code.validated)" @tap="onDeleteItem(code)"/>
                </GridLayout>
              </v-template>
              <v-template if="$even">
              <!-- For items with an odd index, shows the label in red. -->
                <GridLayout backgroundColor="#f6f6f6" class="list-group-item p-x-15 p-y-10" columns="130, 80, 140" rows="auto, auto">
                    <Label row="0" class="list-group-item-heading p-t-10 font-weight-bold">{{code.text}}</Label>
                    <Label col="1" class="list-group-item-heading p-t-10 font-weight-bold">{{code.added_at | moment("YYYY/MM/DD")}}</Label>
                    <button col="2" height="40" width="110" :text="stateText(code.validated)" class="m-l-5 p-l-5" :backgroundColor="stateColor(code.validated)" @tap="onDeleteItem(code)"/>
                </GridLayout>
              </v-template>
            </ListView>
            <Button @tap="onReport" text="Validar Tiquetes" color="black" alignItems="flex-end" class="btn btn-primary"/>
        </FlexboxLayout>

      </TabViewItem>
      

    </TabView>

  </page>
</template>
<script>
import { BarcodeScanner } from "nativescript-barcodescanner";
import database from "../utils/database.js";
let barcodescanner = new BarcodeScanner();
let toast = require("nativescript-toast");
let moment = require("moment");

export default {
  data() {
    return {
      tiquetPrice: 0,
      amountOfTiquets: 0,
      codes: [],
      soldTiquets: [
        {"type":"header" ,"date":"Fecha de Venta","quantity":"Cantidad","total":"Precio"},
        {"type":"tiquet" ,"date":1531763759876,"quantity":"1","total":"35000"},
      ],
      listOfNumbers: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20
      ],
      listOfPrices: [
        {
          name: "Barú",
          price: "15000",
          toString: () => {
            return "Barú";
          }
        },
        {
          name: "Rosario",
          price: "30000",
          toString: () => {
            return "Rosario";
          }
        },
        {
          name: "Caiman",
          price: "45000",
          toString: () => {
            return "Caiman";
          }
        },
        {
          name: "Tierra perdida",
          price: "5000",
          toString: () => {
            return "Tierra perdida";
          }
        },
        {
          name: "Tierra bomba",
          price: "5000",
          toString: () => {
            return "Tierra bomba";
          }
        },
        {
          name: "Tierra baja",
          price: "12000",
          toString: () => {
            return "Tierra baja";
          }
        }
      ]
    };
  },
  methods: {
    save(text, validated) {
      database.getInstance().then(db => {
        db
          .execSQL(
            "insert into codes (code, added_at, validated) values (?,?,?)",
            [text, new Date(), validated]
          )
          .then(id => {
            console.log("The new record id is: ", id);
          })
          .catch(error => {
            console.log("It's not inserting into the table: ", error);
          });
      });
    },
    stateText(validated) {
      let message;
      switch (validated) {
        case 0:
          message = "Pendiente";
          break;
        case 1:
          message = "Validado";
          break;
        case 2:
          message = "Invalidado";
          break;

        default:
          break;
      }

      return message;
    },
    stateColor(validated) {
      let color;
      switch (validated) {
        case 0:
          color = "#ffc107";
          break;
        case 1:
          color = "#28a745";
          break;
        case 2:
          color = "#dc3545";
          break;

        default:
          break;
      }

      return color;
    },
    createTiquet() {

      let price = this.listOfPrices[this.tiquetPrice].price
      let number = this.listOfNumbers[this.amountOfTiquets]

      confirm({
        title: "Vender tiquete",
        message: `Unidades: ${number} 

        Valor unidad: ${price} 

        Total: ${number * price}
        `,
        okButtonText: "Vender",
        cancelButtonText: "Cancelar"
      }).then(result => {
        console.log(result);
        if (result) {
          let sold = {"type":"tiquet" ,"date":Date.now(),"quantity":number,"total":`${number * price}`}
          console.log(Date.now());
          this.soldTiquets.push(sold);
        }
      })
    },
    load() {
      database.getInstance().then(db => {
        this.codes = [];
        db.all("select * from codes").then(resultSet => {
          for (let row in resultSet) {
            this.codes.push({
              id: resultSet[row][0],
              text: resultSet[row][1],
              added_at: resultSet[row][2],
              validated: resultSet[row][3]
            });
          }
        });
      });
    },
    delete(data) {
      database.getInstance().then(db => {
        db.execSQL("DELETE FROM codes WHERE id = ?", [data]).then(result => {
          console.log("The new table is: ", result);
        });
      });
    },
    onDeleteItem(item) {
      console.log("Index: ", item.id);
      confirm({
        title: "Eliminar Código",
        message: "Está seguro que desea eliminar el Código: " + item.text,
        okButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
      }).then(result => {
        console.log(result);
        if (result) {
          this.delete(item.id);
          this.load();
        }
      });
    },
    onReport() {
      toast.makeText("Botón sin funcionalidad por el momento", "long").show();
    },
    onScan() {
      let count = 0;
      let self = this;
      barcodescanner
        .scan({
          formats:
            "QR_CODE,PDF_417,ZTEC,CODE_39,CODE_93,CODE_128,DATA_MATRIX,EAN_8,EAN_13,ITF,UPC_E", // Pass in of you want to restrict scanning to certain types
          message: "Coloqué el código dentro del rectangulo.", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
          showFlipCameraButton: true, // default false
          preferFrontCamera: false, // default false
          showTorchButton: true, // default false
          beepOnScan: true, // Play or Suppress beep on scan (default true)
          torchOn: false, // launch with the flashlight on (default false)
          continuousScanCallback: function(result) {
            count++;

            self.save(result.text, 0);
            self.load();

            console.log(
              result.format + ": " + result.text + " (count: " + count + ")"
            );
            if (count === 10) {
              barcodescanner.stop();
            }
          },
          closeCallback: function() {
            console.log("Scanner closed");
          }, // invoked when the scanner was closed (success or abort)
          resultDisplayDuration: 500, // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
          orientation: "landscape", // Android only, optionally lock the orientation to either "portrait" or "landscape"
          openSettingsIfPermissionWasPreviouslyDenied: true, // On iOS you can send the user to the settings app if access was previously denied
          reportDuplicates: true // which is the default
        })
        .then(result => {}, function(error) {
          console.log("No scan-: " + error);
        })
        .catch(function(error) {
          console.log("No scan: " + error);
        });
    }
  },
  created() {
    this.load();
  }
};
</script>
<style scoped>
  ListPicker {
    height: 35px !important;
  }

</style>