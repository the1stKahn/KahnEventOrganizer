const { default: imagePath } = require("./imagePath");

const doctorProfile = [
  {
    id: 1,
    label: "0815560000",
    image: imagePath.icPhone,
  },
  {
    id: 2,
    label: "noviadrg@gmail.com",
    image: imagePath.icMail,
  },

  {
    id: 3,
    label: "34.2.2.601.2.22.205616",
    image: imagePath.icStr,
  },
  {
    id: 4,
    label: "123/abc/567/2023",
    image: imagePath.icSip,
  },
  {
    id: 5,
    label: "Karangsaru 105, Semarang",
    image: imagePath.icHome,
  },
];

export default { doctorProfile };
