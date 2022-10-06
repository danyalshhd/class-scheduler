import React, { useState } from 'react'
import axios from 'axios';
import  {
  LineChart,
  YAxis,
  XAxis,
  Line
} from 'recharts';

const App = () => {

  const [registrationStatus, setRegistrationStatus] = useState([])
  const [fileIncorrectName, setFileIncorrectName] = useState('')
  const [registrationStats, setRegistrationStats] = useState([]);
  const [loading, isLoading] = useState(false)

  const upload = async (event) => {
    setFileIncorrectName('');
    event.preventDefault()
    const files = document.getElementById('files');
    const formData = new FormData();
    formData.append("uploadcsv", files.files[0]);
    
    if (files.files[0].name.indexOf('.csv') == -1) {
      setFileIncorrectName('Incorrect Type, choose CSV')
      return;
    }
    
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    
    isLoading(true)
    const result = await axios.post("https://excellence-driving.herokuapp.com/v1/registerations", formData, config)
    const stats = await axios.get("https://excellence-driving.herokuapp.com/v1/registerations/stats")
    isLoading(false)
    
    setRegistrationStats(stats.data);
    setRegistrationStatus(result.data.registrationStatus)
  }

  return (
    <div class="container">
        <h3>Please upload class schedule by uploading csv</h3>
        <form id='form' onSubmit={upload}>
            <div class="input-group">
                <label for="files">Select CSV file</label> <br />
                <input id="files" type="file" multiple/>
            </div>
            <br />
            <button disabled={loading} class="submit-btn" type='submit'>Upload</button><br/>
        </form>
        <br />
        
        {fileIncorrectName}        
        
        {registrationStatus.length > 0 &&
          <table>
            <tr>
              <th>Registration ID</th>
              <th>Registration Status</th>
            </tr>
            {registrationStatus.map(rs =>
              <tr>
                <td>
                  {rs.id}
                </td>
                <td>
                  {rs.status}
                </td>
              </tr>
            
            )}
          </table>
        }
        <br />
        <br />
        <h3>Class Schedule Per Day</h3>
        <LineChart width={730} height={250} data={registrationStats}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Line dataKey="value" />
        </LineChart>
    </div>
  )
}

export default App