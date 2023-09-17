<template>
  <div class="w3-container w3-card w3-light-grey w3-text-black">
    <p>
      <label>
        <b>Select a template</b>
      </label>
      <input class="w3-input w3-border" type="file" @change="previewTemplate" accept=".html" />
    </p>

    <p>
      <label>
        <b>Select a fragment</b>
      </label>
      <input class="w3-input w3-border" type="file" @change="previewFragment" accept=".html" />
    </p>

    <!-- <p>
      <label>
        <b>Select images</b>
      </label>
      <input
        class="w3-input w3-border"
        type="file"
        @change="previewImages"
        multiple
        accept="image/*"
      />
    </p>-->

    <p>
      <label>
        <b>To</b>
        <small>(Use commas to separate multiple emails.)</small>
      </label>
      <input class="w3-input w3-border" name="email" type="text" v-model="to" @change="setData" />
    </p>

    <p>
      <button
        @click="send"
        :disabled="!isDisabled"
        class="w3-button w3-block w3-section w3-black w3-ripple w3-padding"
      >
        <b>Send</b>
      </button>
    </p>

    <div id="loader">
      <div class="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../../api/mailer";
import Swal from "sweetalert2";

export default {
  name: "landing-page",
  data() {
    return {
      template: {},
      fragment: {},
      // images: [],
      to: ""
    };
  },
  methods: {
    previewTemplate(event) {
      this.template = {};
      this.template = event.target.files[0];
    },
    previewFragment(event) {
      this.fragment = {};
      this.fragment = event.target.files[0];
    },
    /* previewImages(event) {
      this.images = [];
      Array.from(event.target.files).forEach(file => {
        this.images.push(file.path);
      });
    }, */
    async send() {
      const self = this;
      document.getElementById("loader").style.display = "flex";
      localStorage.setItem("to", this.to);
      try {
        const response = await api.sendMail(self);
        Swal.fire({
          type: "success",
          title: "Good job!",
          text: "The mail has been sent successfully.",
          preConfirm: self.close
        });

        setTimeout(self.close, 5000);
      } catch (error) {
        console.log(error);
        Swal.fire({
          type: "error",
          title: "Oops...",
          text: error,
          preConfirm: () => {
            document.getElementById("loader").style.display = "none";
          }
        });
      }
    },
    close() {
      const self = this;
      self.reset();
      document.getElementById("loader").style.display = "none";
      Swal.close();
    },
    setData(event) {
      localStorage.setItem("to", event.target.value);
    },
    getData() {
      this.to = localStorage.getItem("to") || [];
    },
    validEmail(value) {
      if (typeof value === "undefined" || value === null || value === "") {
        return false;
      }
      return /^[\W]*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4}[\W]*,{1}[\W]*)*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4})[\W]*$/.test(
        value
      );
    },
    reset() {
      this.template = {};
      this.fragment = {};
      /* this.images = []; */
      document.querySelectorAll('input[type="file"]').forEach(function(input) {
        input.value = "";
      });
    }
  },
  mounted() {
    document.getElementById("loader").style.display = "none";
    this.getData();
  },
  computed: {
    isDisabled() {
      return this.template.name && this.validEmail(this.to);
    }
  }
};
</script>

<style>
*,
*:focus {
  outline: none !important;
}

#app {
  background-color: #f1f1f1;
}

p {
  margin: 20px 0px;
  font-size: 16px;
}

input {
  margin: 10px 0px !important;
}

.swal2-container.swal2-shown {
  background-color: transparent !important;
}

#loader {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
}
.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}
</style>
