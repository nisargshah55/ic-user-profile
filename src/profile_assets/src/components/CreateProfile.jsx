import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Form } from 'react-bootstrap';
import { useHistory } from "react-router-dom";
import PropTypes from 'prop-types';
import { profile as profileCanister } from "../../../declarations/profile";
import { toast } from 'react-toastify';

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

  const [allValues, setAllValues] = useState({
    name: '',
    surname: '',
    age: '',
    city: '',
    state: '',
    country: '',
  });

  const getProfileById = async (id, isAddMode) => {
    if (!isAddMode) {
      let response = await profileCanister.read(parseInt(id));
      if ("ok" in response) {
        response.ok.details.age = parseInt(response.ok.details.age);
        setAllValues(
          response.ok.details
        )
      } else {
        console.error(response.err);
        toast.error("Failed to fetch profile details", options);
      }

    }
  }


  useEffect(() => {
    getProfileById(id, isAddMode);
  }, [id, isAddMode]);

  const handleChange = (e, key) => {
    setAllValues({ ...allValues, [key]: e.target.value });
  }

  const handleOnSubmit = () => {

    const profileDetails = {
      details: {
        name: allValues.name,
        surname: allValues.surname,
        age: parseInt(allValues.age),
        city: allValues.city,
        state: allValues.state,
        country: allValues.country
      },
      image: []
    }

    if (isAddMode) {
      profileCanister.create(profileDetails).then(response => {
        if (response) {
          toast.success("Profile Added Successfully !", options);
          history.push("/profiles");
        } else {
          toast.error("Add Profile Failure !", options);
        }

      }).catch(() => {
        toast.error("Add Profile Failure !", options);
      });
    } else {
      profileCanister.update(id, profileDetails).then((response) => {
        toast.success("Profile updated Successfully !", options);
        history.push("/profiles");
      }).catch(() => {
        toast.error("Update Profile Failure !", options);
      });
    }

  }

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

          </Form>
          <Col md={6} className="ml-0 mt-3 px-0">
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