import React, { useState, useEffect } from 'react';
import { profile as profileCanister } from "../../../declarations/profile";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { NavLink } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

const actionWidth = {
  width: '15%'
};


const ListProfiles = (props) => {
  const useRowStyles = makeStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
  });

  const classes = useRowStyles();

  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {

    profileCanister.listAllProfiles().then((result) => {
      if (result) {
        setProfiles(result);
      }
    });
  }

  const addProfile = (() => {
    props.history.push('/add');
  });

  const editProfile = ((id) => {
    props.history.push(`/edit/${id}`);
  });

  const deleteProfile = ((id) => {
    profileCanister.delete(parseInt(id)).then((result) => {
      if (result) {
        if (response) {
          toast.success("Profile Deleted Successfully !", options);
          loadProfiles();
        }
      }
    }).catch(() => {
      toast.error("Delete Profile Failure !", options);
    });
  });

  return (
    <div className="mt-5 row d-flex justify-content-between align-items-center">
      <h5 className="text-center">Profile List</h5>
      <div>

        <button className="btn btn-primary" onClick={addProfile}>
          Add New Profile
        </button>
      </div>


      <TableContainer className='mt-2' component={Paper}>
        <Table sx={{ minWidth: 650 }} className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell >Surname</TableCell>
              <TableCell >Age</TableCell>
              <TableCell >City</TableCell>
              <TableCell >State</TableCell>
              <TableCell>Country</TableCell>
              <TableCell ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.length > 0 ?

              profiles.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.details.name}
                  </TableCell>
                  <TableCell >{row.details.surname}</TableCell>
                  <TableCell >{parseInt(row.details.age)}</TableCell>
                  <TableCell >{row.details.city}</TableCell>
                  <TableCell >{row.details.state}</TableCell>
                  <TableCell >{row.details.country}</TableCell>
                  <TableCell style={actionWidth}>
                    <IconButton color="primary">
                      <NavLink to={`/edit/${parseInt(row.id)}`} className="btn btn-sm text-primary mr-1"  >
                        <EditIcon />
                      </NavLink>
                    </IconButton>

                    <IconButton color="secondary" onClick={() => deleteProfile(parseInt(row.id))}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))

              :
              <TableRow>
                <TableCell>
                  No User Profiles Found!
                </TableCell>
              </TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

    </div >
  )
}
export default ListProfiles;