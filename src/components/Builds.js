import React from 'react'
import PropTypes from 'prop-types';

const Builds = ({ builds }) => {

  return (
    <table className="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
        <th scope="col">Created</th>
      </tr>
    </thead>
    <tbody>
      { builds.map((build, index) => (
        <tr key={build._id}>
          <th scope="row">{ index }</th>
          <td>{build._id}</td>
          <td>{build.name}</td>
          <td>{build.createdAt}</td>
        </tr>
      ))}
    </tbody>
  </table>
  )
};

Builds.propTypes = {
  builds: PropTypes.array,
}

export default Builds
