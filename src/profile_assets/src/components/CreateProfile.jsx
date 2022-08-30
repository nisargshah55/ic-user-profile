import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Form } from 'react-bootstrap';
import { useHistory } from "react-router-dom";
import PropTypes from 'prop-types';
import { profile as profileCanister, canisterId } from "../../../declarations/profile";
import { toast } from 'react-toastify';
import { resizeImage } from "./resize";
import { convertToBase64 } from "./utils";
import { v4 as uuidv4 } from 'uuid';

const pictureStyle = {
  'width': '50%',
  'height': '100%',
  'display': 'flex',
  'overflow': 'hidden'
}

const imageStyle = {
  'width': '100%',
  'height': '100%',
  'minHeight': '100%'
}

const CreateProfile = ({ match }) => {
  const history = useHistory();

  const id = parseInt(match.params.id);
  const isAddMode = !id;

  const options = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored"
  }

  const imageSize = 200;

  const [allValues, setAllValues] = useState({
    name: '',
    surname: '',
    age: '',
    city: '',
    state: '',
    country: '',
    imageFile: ''
  });

  const [preview, setPreview] = useState("");
  const [activeImage, setActiveImage] = useState("");

  const getProfileById = async (id, isAddMode) => {
    if (!isAddMode) {
      let response = await profileCanister.read(parseInt(id));

      if ("ok" in response) {
        response.ok.details.age = parseInt(response.ok.details.age);
        setAllValues(
          response.ok.details
        )

        const imageFile = response.ok.details.imageFile;
        loadImage(imageFile, parseInt(id));
      } else {
        console.error(response.err);
        toast.error("Failed to fetch profile details", options);
      }

    }
  }

  const loadImage = (batch_name) => {

    if (!batch_name) {
      return;
    }

    console.log(`http://localhost:8000/assets/${batch_name}?canisterId=${canisterId}`);
    setActiveImage(`http://localhost:8000/assets/${batch_name}?canisterId=${canisterId}`);
    setPreview(`http://localhost:8000/assets/${batch_name}?canisterId=${canisterId}`);
  }


  useEffect(() => {
    getProfileById(id, isAddMode);
  }, [id, isAddMode]);

  const handleChange = (e, key) => {
    setAllValues({ ...allValues, [key]: e.target.value });
  }

  const uploadChunk = async ({ batch_name, chunk }) => profileCanister.create_chunk({
    batch_name,
    content: [...new Uint8Array(await chunk.arrayBuffer())]
  });

  const uploadImage = async (file, fileName) => {

    if (!file) {
      return;
    }

    console.log('start upload');

    const batch_name = fileName;
    const promises = [];
    const chunkSize = 500000;

    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);

      promises.push(uploadChunk({
        batch_name,
        chunk
      }));
    }

    const chunkIds = await Promise.all(promises);

    await profileCanister.commit_batch({
      batch_name,
      chunk_ids: chunkIds.map(({ chunk_id }) => chunk_id),
      content_type: file.type
    });

    console.log('uploaded');


  };

  const handleOnSubmit = async () => {

    let fileName;
    let file;

    if (allValues.imageFile) {
      fileName = allValues.imageFile[0].name + "_" + uuidv4();
      file = allValues.imageFile[0];
    }


    const profileDetails = {
      details: {
        name: allValues.name,
        surname: allValues.surname,
        age: parseInt(allValues.age),
        city: allValues.city,
        state: allValues.state,
        country: allValues.country,
        imageFile: fileName || ""
      }
    }

    if (isAddMode) {
      profileCanister.create(profileDetails).then(async response => {

        if (parseInt(response) > 0) {

          uploadImage(file, fileName);
          toast.success("Profile Added Successfully !", options);
          history.push("/profiles");
        } else {
          toast.error("Add Profile Failure !", options);
        }

      }).catch(() => {
        toast.error("Add Profile Failure !", options);
      });
    } else {
      profileCanister.update(id, profileDetails).then(async (response) => {

        await uploadImage(file, fileName);
        toast.success("Profile updated Successfully !", options);
        history.push("/profiles");
      }).catch(() => {
        toast.error("Update Profile Failure !", options);
      });
    }

  }

  const handleImage = (file) => {

    const newState = { profile: allValues };
    newState.profile.imageFile = file ? [file] : [];
    setAllValues(newState.profile);
  }

  const handleFile = async (e) => {

    const selectedFile = e.target.files[0];

    const config = {
      quality: 1,
      width: imageSize,
      height: imageSize,
    };

    const resizedString = await convertToBase64(
      await resizeImage(selectedFile, config)
    );


    setActiveImage(resizedString);
    setPreview(resizedString);
    handleImage(selectedFile);
  };

  const imgSrc = preview ? preview : activeImage ? activeImage : "";

  return (
    <div className="mt-3 row d-flex justify-content-between align-items-center">
      <h5 className='text-center'>
        {isAddMode ? 'Create Profile' : 'Edit Profile'}
      </h5>

      <Container className='px-0'>
        <Col md={12} className='px-0'>
          <Form>
            <Form.Row>
              <Form.Group as={Col} controlId="name" className="pt-3">
                <Form.Label>Name</Form.Label>
                <Form.Control value={allValues.name} type="text" placeholder="Enter Name" onChange={(event) => handleChange(event, 'name')} />
              </Form.Group>

              <Form.Group as={Col} controlId="surname" className="pt-3">
                <Form.Label>Surname</Form.Label>
                <Form.Control value={allValues.surname} type="text" placeholder="Enter Surname" onChange={(event) => handleChange(event, 'surname')} />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group as={Col} controlId="age" className="pt-3">
                <Form.Label>Age</Form.Label>
                <Form.Control value={allValues.age} type="number" placeholder="Enter Age" onChange={(event) => handleChange(event, 'age')} />
              </Form.Group>

              <Form.Group as={Col} controlId="city" className="pt-3">
                <Form.Label>City</Form.Label>
                <Form.Control value={allValues.city} type="text" placeholder="Enter City" onChange={(event) => handleChange(event, 'city')} />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group as={Col} controlId="state" className="pt-3">
                <Form.Label>State</Form.Label>
                <Form.Control value={allValues.state} type="text" placeholder="Enter State" onChange={(event) => handleChange(event, 'state')} />
              </Form.Group>

              <Form.Group as={Col} controlId="country" className="pt-3">
                <Form.Label>Country</Form.Label>
                <Form.Control value={allValues.country} type="text" placeholder="Enter Country" onChange={(event) => handleChange(event, 'country')} />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group controlId="imageFile" className="mb-3" >
                <Form.Label>Upload Image</Form.Label>
                <Form.Control type="file" onChange={handleFile}
                  accept="image/*" />
              </Form.Group>

              <Form.Group className='ml-5'>
                <picture style={pictureStyle}>
                  {imgSrc ? <img style={imageStyle} src={imgSrc} /> : null}
                </picture>
              </Form.Group>
            </Form.Row>

          </Form>
          <Col md={6} className="ml-0 my-3 px-0">
            <Button variant="primary" onClick={() => handleOnSubmit()}>
              Submit
            </Button>
          </Col>
        </Col>
      </Container>
    </div>
  )

}

CreateProfile.propTypes = {
  match: PropTypes.object.isRequired,
};

export default CreateProfile;