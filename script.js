"use strict";

// Patokan konversi: 1 bata = 3,5 m x 3,5 m = 12,25 m²
const UKURAN_SISI_BATA = 3.5;
const LUAS_PER_BATA = UKURAN_SISI_BATA * UKURAN_SISI_BATA;
const BATAS_BATA = 1000000;
const BATAS_VISUAL = 400;

const inputBata = document.getElementById("bata");
const inputMeter = document.getElementById("meter");
const gambarTanah = document.getElementById("gambarTanah");
const outputPanjang = document.getElementById("panjang");
const outputLebar = document.getElementById("lebar");
const outputLuas = document.getElementById("luas");
const pesanValidasi = document.getElementById("pesanValidasi");
const petunjukKosong = document.querySelector(".plot-empty-hint");

// Format angka mengikuti kebiasaan penulisan Indonesia.
function formatAngka(nilai, digitMaksimal = 4) {
    if (!Number.isFinite(nilai)) return "0";
    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: digitMaksimal
    }).format(nilai);
}

function tampilkanPesan(pesan = "") {
    pesanValidasi.textContent = pesan;
}

function kosongkanHasil() {
    outputPanjang.textContent = "0";
    outputLebar.textContent = "0";
    outputLuas.textContent = "0";
    gambarTanah.innerHTML = "";
    gambarTanah.style.gridTemplateColumns = "repeat(1, minmax(0, 1fr))";
    petunjukKosong.hidden = false;
}

// Menggambar susunan petak yang seimbang.
// Dimensi yang ditampilkan adalah dimensi ilustrasi susunan, bukan ukuran pasti tanah.
function gambarPetak(bata) {
    gambarTanah.innerHTML = "";

    if (bata <= 0) {
        gambarTanah.style.gridTemplateColumns = "repeat(1, minmax(0, 1fr))";
        petunjukKosong.hidden = false;
        return;
    }

    petunjukKosong.hidden = true;

    const jumlahPetak = Math.ceil(bata);
    const jumlahKolom = Math.ceil(Math.sqrt(jumlahPetak));
    const jumlahBaris = Math.ceil(jumlahPetak / jumlahKolom);
    gambarTanah.style.gridTemplateColumns =
        `repeat(${jumlahKolom}, minmax(0, 1fr))`;

    const petakDitampilkan = Math.min(jumlahPetak, BATAS_VISUAL);

    for (let i = 0; i < petakDitampilkan; i++) {
        const kotak = document.createElement("div");
        const sisaBata = bata - i;

        if (sisaBata >= 1) {
            kotak.textContent = formatAngka(i + 1, 0);
        } else {
            // Petak terakhir digambar sebagian jika jumlah bata pecahan.
            const persen = Math.max(0, Math.min(100, sisaBata * 100));
            kotak.textContent = `${formatAngka(sisaBata, 2)} bata`;
            kotak.style.background =
                `linear-gradient(90deg, #b9dfc3 ${persen}%, #edf3ee ${persen}%)`;
            kotak.style.borderStyle = "dashed";
        }

        gambarTanah.appendChild(kotak);
    }

    if (jumlahPetak > BATAS_VISUAL) {
        const info = document.createElement("p");
        info.className = "visual-limit-note";
        info.textContent =
            `Menampilkan ${BATAS_VISUAL} dari ${formatAngka(jumlahPetak, 0)} petak agar aplikasi tetap ringan.`;
        gambarTanah.appendChild(info);
    }

    return { jumlahKolom, jumlahBaris };
}

function hitungTanah(bata) {
    if (!Number.isFinite(bata) || bata <= 0) {
        kosongkanHasil();
        return;
    }

    const totalLuas = bata * LUAS_PER_BATA;
    const susunan = gambarPetak(bata);

    // Ini hanya ukuran kotak pembungkus susunan ilustrasi.
    const panjangSusunan = susunan.jumlahKolom * UKURAN_SISI_BATA;
    const lebarSusunan = susunan.jumlahBaris * UKURAN_SISI_BATA;

    outputPanjang.textContent = formatAngka(panjangSusunan);
    outputLebar.textContent = formatAngka(lebarSusunan);
    outputLuas.textContent = formatAngka(totalLuas);
}

function bacaInput(input) {
    if (input.value.trim() === "") {
        return { kosong: true, valid: true, nilai: 0 };
    }

    const nilai = Number(input.value);
    const valid = Number.isFinite(nilai) && nilai >= 0;
    return { kosong: false, valid, nilai };
}

// Saat jumlah bata diubah, luas m² dihitung otomatis.
inputBata.addEventListener("input", function () {
    const hasil = bacaInput(inputBata);

    if (hasil.kosong) {
        inputMeter.value = "";
        tampilkanPesan("");
        kosongkanHasil();
        return;
    }

    if (!hasil.valid) {
        inputMeter.value = "";
        tampilkanPesan("Masukkan jumlah bata berupa angka nol atau lebih.");
        kosongkanHasil();
        return;
    }

    if (hasil.nilai > BATAS_BATA) {
        inputMeter.value = "";
        tampilkanPesan(`Jumlah maksimal yang dapat dihitung adalah ${formatAngka(BATAS_BATA, 0)} bata.`);
        kosongkanHasil();
        return;
    }

    tampilkanPesan("");
    inputMeter.value = String(Number((hasil.nilai * LUAS_PER_BATA).toFixed(6)));
    hitungTanah(hasil.nilai);
});

// Saat luas m² diubah, jumlah bata ekuivalen dihitung otomatis.
inputMeter.addEventListener("input", function () {
    const hasil = bacaInput(inputMeter);

    if (hasil.kosong) {
        inputBata.value = "";
        tampilkanPesan("");
        kosongkanHasil();
        return;
    }

    if (!hasil.valid) {
        inputBata.value = "";
        tampilkanPesan("Masukkan luas berupa angka nol atau lebih.");
        kosongkanHasil();
        return;
    }

    const bata = hasil.nilai / LUAS_PER_BATA;

    if (!Number.isFinite(bata) || bata > BATAS_BATA) {
        inputBata.value = "";
        tampilkanPesan(`Luas terlalu besar. Batas perhitungan adalah ${formatAngka(BATAS_BATA * LUAS_PER_BATA, 0)} m².`);
        kosongkanHasil();
        return;
    }

    tampilkanPesan("");
    inputBata.value = String(Number(bata.toFixed(8)));
    hitungTanah(bata);
});

// Tampilan awal selalu bersih.
kosongkanHasil();

// Mendaftarkan Service Worker untuk penggunaan offline pada HTTPS/localhost.
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .catch(error => console.error("Service Worker gagal didaftarkan:", error));
    });
}
