import React, { Component, Fragment } from "react";
import Header from "../../utils/header";
import axios from "axios";
import AutoComplete from "../Dropdown/AutoComplete";
import DatePicker from "react-datepicker";
import Loader from 'react-loader-spinner';
import { css } from '@emotion/core';
import PacmanLoader from 'react-spinners/PacmanLoader';
import "./Home.css";

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courses: [],
      courseName: [],
      provider: [],
      universities: [],
      parentSubject: [],
      childSubject: [],

      //AutoComplete
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: "",
      id: "",
      selectedValue: "",
      startDate: "",
      sliderValue: null,

      //for child subject
      _activeSuggestion: 0,
      _filteredSuggestions: [],
      _showSuggestions: false,
      _userInput: "",
      _selectedValue: "",

      //search
      proSearch: false,
      uniSearch: false,
      subSearch: false,

      showFilter: false,
      filter1: false,
      filter2: false,
      loading: true
    };
  }
  componentWillMount = () => {
    axios("https://api.myjson.com/bins/1fq8pm")
      .then(res => {
        var data = res.data;
        this.setState(
          {
            courses: data
          },
          () => {
            this.settingData();
          }
        );
      })
      .catch(err => {
        console.log("error : ", err);
      });
  };
  settingData = () => {
    const { courses } = this.state;
    var AllProvider = [],
      AllUniversities = [],
      AllParentSubject = [],
      AllCourseName = [],
      AllNextSessionDate = [],
      AllChildSubject = [];
    courses.map(course => {
      if (course.Provider !== "") AllProvider.push(course.Provider);

      if (course.Universities !== "")
        AllUniversities.push(course.Universities.Institutions);

      if (course["Parent Subject"] !== "")
        AllParentSubject.push(course["Parent Subject"]);

      if (course["Course Name"] !== "")
        AllCourseName.push(course["Course Name"]);

      if (course["Next Session Date"] !== "")
        AllNextSessionDate.push(course["Next Session Date"]);

      if (course["Child Subject"] !== "")
        AllChildSubject.push(course["Child Subject"]);
    });
    var provider = [...new Set(AllProvider)];
    var universities = [...new Set(AllUniversities)];
    var parentSubject = [...new Set(AllParentSubject)];
    var courseName = [...new Set(AllCourseName)];
    var childSubject = [...new Set(AllChildSubject)];
    this.setState({
      provider: provider,
      universities: universities,
      parentSubject: parentSubject,
      courseName: courseName,
      childSubject: childSubject,
      loading: false
    });
  };

  onChange = (e, id) => {
    var suggestions;
    this.setState({
      id: id,
      selectedValue: ""
    });
    if (id === "Provider") {
      suggestions = this.state.provider;
    }
    if (id === "Universities") {
      suggestions = this.state.universities;
    }
    if (id === "Parent Subject") {
      suggestions = this.state.parentSubject;
    }
    if (id === "Course Name") {
      suggestions = this.state.courseName;
    }
    if (id === "Child Subject") {
      suggestions = this.state.childSubject;
    }
    const userInput = e.currentTarget.value;

    // Filter our suggestions that contain the user's input
    const filteredSuggestions = suggestions.filter(
      suggestion =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    // Update the user input and filtered suggestions, reset the active
    // suggestion and make sure the suggestions are shown
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: e.currentTarget.value
    });
  };

  onClick = e => {
    console.log("onClick");
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: e.currentTarget.innerText,
      selectedValue: e.currentTarget.innerText,
      showFilter: false
    });
  };

  onKeyDown = e => {
    const { activeSuggestion, filteredSuggestions } = this.state;
    if (e.keyCode === 13) {
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        userInput: filteredSuggestions[activeSuggestion],
        selectedValue: filteredSuggestions[activeSuggestion],
        showFilter: true
      });
    } else if (e.keyCode === 38) {
      if (activeSuggestion === 0) return;

      this.setState({
        activeSuggestion: activeSuggestion - 1
      });
    } else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) return;

      this.setState({
        activeSuggestion: activeSuggestion + 1
      });
    }
  };

  handleDateChange = date => {
    this.setState({
      startDate: date,
      _selectedValue: "",
      _userInput: ""
    });
  };

  filterByDate = (date, course) => {
    if (
      course["Next Session Date"] !== "Self paced" &&
      course["Next Session Date"] !== "" &&
      course["Next Session Date"] !== "NA"
    ) {
      var setDate = date.toString().substring(4, 15);
      var year = setDate.substring(7);
      var day = setDate.substring(4, 6);
      var month = setDate.substring(0, 3).toLowerCase();

      var course_date = course["Next Session Date"]
        .replace(/,/g, "")
        .toLowerCase()
        .split(/(\s+)/);
      var course_date_length = course["Next Session Date"]
        .match(/\d+/g)
        .map(Number);
      if (course_date.includes(year)) {
        if (course_date.includes(month)) {
          console.log("month matched");
          if (course_date_length > 1) {
            if (course_date.includes(day)) {
              console.log("day matched");
              return true;
            }
          } else {
            return true;
          }
        }
      }
    }
  };

  handleSlider = e => {
    this.setState({
      sliderValue: e.target.value,
      _selectedValue: "",
      _userInput: ""
    });
  };

  filterByLength = (sliderValue, course) => {
    if (course["Length"] === parseInt(sliderValue)) {
      return true;
    } else {
      return false;
    }
  };
  filterByDateAndLength = (sliderValue, startDate, course) => {
    if (
      course["Length"] === parseInt(sliderValue) &&
      this.filterByDate(startDate, course)
    ) {
      return true;
    } else {
      return false;
    }
  };

  resetFilter = e => {
    e.preventDefault();
    this.setState({
      startDate: "",
      sliderValue: null
    });
  };

  //for child subject
  _onChange = (e, id) => {
    this.setState({
      startDate: "",
      sliderValue: null
    });
    var suggestions = this.state.childSubject;
    const userInput = e.currentTarget.value;
    const _filteredSuggestions = suggestions.filter(
      suggestion =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );
    this.setState({
      _activeSuggestion: 0,
      _filteredSuggestions,
      _showSuggestions: true,
      _userInput: e.currentTarget.value
    });
  };

  _onClick = e => {
    this.setState({
      _activeSuggestion: 0,
      _filteredSuggestions: [],
      _showSuggestions: false,
      _userInput: e.currentTarget.innerText,
      _selectedValue: e.currentTarget.innerText
    });
  };
  _onKeyDown = e => {
    const { _activeSuggestion, _filteredSuggestions } = this.state;
    if (e.keyCode === 13) {
      this.setState({
        _activeSuggestion: 0,
        _showSuggestions: false,
        _userInput: _filteredSuggestions[_activeSuggestion],
        _selectedValue: _filteredSuggestions[_activeSuggestion]
      });
    } else if (e.keyCode === 38) {
      if (_activeSuggestion === 0) return;

      this.setState({
        _activeSuggestion: _activeSuggestion - 1
      });
    } else if (e.keyCode === 40) {
      if (_activeSuggestion - 1 === _filteredSuggestions.length) return;

      this.setState({
        _activeSuggestion: _activeSuggestion + 1
      });
    }
  };
  //
  handleSearch = id => {
    if (id === "Provider") {
      this.setState({
        proSearch: !this.state.proSearch,
        uniSearch: false,
        subSearch: false,
        showFilter: false,
        filter1: false,
        filter2: false,
        id: "",
        selectedValue: "",
        startDate: "",
        sliderValue: null,
        _selectedValue: ""
      });
    }
    if (id === "Universities") {
      this.setState({
        uniSearch: !this.state.uniSearch,
        proSearch: false,
        subSearch: false,
        showFilter: false,
        filter1: false,
        filter2: false,
        id: "",
        selectedValue: "",
        startDate: "",
        sliderValue: null,
        _selectedValue: ""
      });
    }
    if (id === "Parent Subject") {
      this.setState({
        subSearch: !this.state.subSearch,
        proSearch: false,
        uniSearch: false,
        showFilter: false,
        filter1: false,
        filter2: false,
        id: "",
        selectedValue: "",
        startDate: "",
        sliderValue: null,
        _selectedValue: ""
      });
    }
  };

  handleFilter = id => {
    if (id === "Date and Length") {
      this.setState({ filter1: !this.state.filter1, filter2: false });
    }
    if (id === "Child Subject") {
      this.setState({ filter2: !this.state.filter2, filter1: false });
    }
  };

  render() {
    const {
      courses,
      provider,
      universities,
      parentSubject,
      courseName,
      childSubject,
      activeSuggestion,
      id,
      filteredSuggestions,
      showSuggestions,
      userInput,
      selectedValue,
      startDate,
      sliderValue,
      _activeSuggestion,
      _filteredSuggestions,
      _showSuggestions,
      _userInput,
      _selectedValue,
      proSearch,
      uniSearch,
      subSearch,
      showFilter,
      filter1,
      filter2
    } = this.state;
    var courseList;
    var counter = 0;
    if (selectedValue) {
      courseList = courses.map((course, index) => {
        if (
          course[id] === selectedValue ||
          course[id].Institutions === selectedValue
        ) {
          //fliter only by date
          if (startDate && sliderValue === null) {
            if (this.filterByDate(startDate, course)) {
              counter++;
              return (
                <li className="list-group-item" key={index}>
                  {course["Course Name"]}
                </li>
              );
            }
          }
          //filter only by Length
          else if (
            sliderValue !== null &&
            (startDate === null || startDate === "")
          ) {
            if (this.filterByLength(sliderValue, course)) {
              console.log("cousrse matched : ", course);
              counter++;
              return (
                <li className="list-group-item" key={index}>
                  {course["Course Name"]}
                </li>
              );
            }
          }
          //filter by both Length and Date
          else if (sliderValue !== null && startDate) {
            if (this.filterByDateAndLength(sliderValue, startDate, course)) {
              console.log("cousrse matched : ", course);
              counter++;
              return (
                <li className="list-group-item" key={index}>
                  {course["Course Name"]}
                </li>
              );
            }
          }
          //filter by child subject only
          else if (_selectedValue !== "") {
            if (course["Child Subject"] === _selectedValue) {
              console.log("cousrse matched : ", course);
              counter++;
              return (
                <li className="list-group-item" key={index}>
                  {course["Course Name"]}
                </li>
              );
            }
          }
          //No filter
          else {
            counter++;
            return (
              <li className="list-group-item" key={index}>
                {course["Course Name"]}
              </li>
            );
          }
        }
      });
    }else{
        courseList = courses.map((course, index) => {
            counter++
           return <li className="list-group-item" key={index}>
                {course["Course Name"]}
            </li>
        })
    }
    console.log('loading : ', this.state.loading)
    return (
      <Fragment> 
        {this.state.loading && 
            <div style={style.overlay}></div>
        }  
        <Header />
        <div className="container">
          <div className="row" style={style.row}>
            <div className='loader-section'>
                <PacmanLoader
                css={override}
                sizeUnit={"px"}
                size={80}
                color={'#813588'}
                loading={this.state.loading}
                />
            </div>
            <form
              className="col-md-8"
              onSubmit={e => e.preventDefault()}
              style={style.leftRow}
            >
              <div className="form-row">
                <div className="form-group col-md-4" style={style.searchCol}>
                  <label style={style.label}>Provider</label>
                  <i
                    className="fa fa-search"
                    aria-hidden="true"
                    style={style.searchIcon}
                    onClick={() => this.handleSearch("Provider")}
                  />
                  {proSearch && (
                    <AutoComplete
                      suggestions={provider}
                      onChange={e => this.onChange(e, "Provider")}
                      onClick={this.onClick}
                      onKeyDown={this.onKeyDown}
                      activeSuggestion={activeSuggestion}
                      filteredSuggestions={filteredSuggestions}
                      showSuggestions={
                        id === "Provider" ? showSuggestions : false
                      }
                      userInput={id === "Provider" ? userInput : ""}
                    />
                  )}
                </div>
                <div className="form-group col-md-4" style={style.searchCol}>
                  <label style={style.label}>Universities</label>
                  <i
                    className="fa fa-search"
                    aria-hidden="true"
                    style={style.searchIcon}
                    onClick={() => this.handleSearch("Universities")}
                  />
                  {uniSearch && (
                    <AutoComplete
                      suggestions={universities}
                      onChange={e => this.onChange(e, "Universities")}
                      onClick={this.onClick}
                      onKeyDown={this.onKeyDown}
                      activeSuggestion={activeSuggestion}
                      filteredSuggestions={filteredSuggestions}
                      showSuggestions={
                        id === "Universities" ? showSuggestions : false
                      }
                      userInput={id === "Universities" ? userInput : ""}
                    />
                  )}
                </div>
                <div className="form-group col-md-4" style={style.searchCol}>
                  <label style={style.label}>Subject</label>
                  <i
                    className="fa fa-search"
                    aria-hidden="true"
                    style={style.searchIcon}
                    onClick={() => this.handleSearch("Parent Subject")}
                  />
                  {subSearch && (
                    <AutoComplete
                      suggestions={parentSubject}
                      onChange={e => this.onChange(e, "Parent Subject")}
                      onClick={this.onClick}
                      onKeyDown={this.onKeyDown}
                      activeSuggestion={activeSuggestion}
                      filteredSuggestions={filteredSuggestions}
                      showSuggestions={
                        id === "Parent Subject" ? showSuggestions : false
                      }
                      userInput={id === "Parent Subject" ? userInput : ""}
                    />
                  )}
                </div>
                <div className="form-group col-md-6">
                  <label style={style.label}>Search Any Course</label>
                  <AutoComplete
                    suggestions={courseName}
                    onChange={e => this.onChange(e, "Course Name")}
                    onClick={this.onClick}
                    onKeyDown={this.onKeyDown}
                    activeSuggestion={activeSuggestion}
                    filteredSuggestions={filteredSuggestions}
                    showSuggestions={
                      id === "Course Name" ? showSuggestions : false
                    }
                    userInput={id === "Course Name" ? userInput : ""}
                  />
                </div>
              </div>

              {/* filters */}
              {showFilter && (
                <div className="form-row">
                  <div>
                    <button
                      type="button"
                      class="btn btn-danger wrn-btn"
                      style={style.searchBtn}
                      onClick={() => this.handleFilter("Date and Length")}
                    >
                      Filter by Date and Length
                    </button>
                    {filter1 && (
                      <Fragment>
                        <div className="col-md-12">
                          <label>Next Session Date</label>
                          <br />
                          <DatePicker
                            selected={this.state.startDate}
                            onChange={this.handleDateChange}
                            className="form-control"
                          />
                        </div>
                        <div className="slidecontainer col-md-12">
                          <label>Length</label>
                          <br />
                          <input
                            type="range"
                            min="1"
                            max="30"
                            value={sliderValue}
                            class="slider"
                            id="myRange"
                            onChange={this.handleSlider}
                          />
                          <div style={{ position: "absolute" }}>
                            <em>{sliderValue}</em>
                          </div>
                        </div>
                        <div className="col-md-12" style={{ margin: "30px" }}>
                          <button
                            className="btn btn-primary"
                            onClick={this.resetFilter}
                          >
                            Reset Filter
                          </button>
                        </div>
                      </Fragment>
                    )}
                  </div>
                  <div className="col-md-4">
                    <button
                      type="button"
                      className="btn btn-danger wrn-btn"
                      style={style.searchBtn}
                      onClick={() => this.handleFilter("Child Subject")}
                    >
                      Filter by Child Subject
                    </button>
                    {filter2 && (
                      <Fragment>
                        <label>Child Subject</label>
                        <br />
                        <AutoComplete
                          suggestions={childSubject}
                          onChange={e => this._onChange(e, "Child Subject")}
                          onClick={this._onClick}
                          onKeyDown={this._onKeyDown}
                          activeSuggestion={_activeSuggestion}
                          filteredSuggestions={_filteredSuggestions}
                          showSuggestions={_showSuggestions}
                          userInput={_userInput}
                        />
                      </Fragment>
                    )}
                  </div>
                </div>
              )}
            </form>
            <div className="col-md-4" style={style.listItem}>
              <div className="nav navbar" style={style.courseHeader}>
                <p>
                  Courses
                  {id === "Provider"
                    ? " with Provider " + selectedValue
                    : id === "Universities"
                    ? " with Universities " + selectedValue
                    : id === "Parent Subject"
                    ? " with Parent Subject " + selectedValue
                    : ""}
                  {startDate.toString() !== "" &&
                    " with Next Session Date " +
                      startDate.toString().substring(4, 15)}
                  {sliderValue !== null && " with Length " + sliderValue}
                  {_selectedValue !== "" &&
                    " with Child Subject " + _selectedValue}
                </p>
                <em style={{ fontSize: "x-small" }}>
                  {courseList && "Total courses found: " + counter}
                </em>
              </div>
              <ul className="list-group">{courseList}</ul>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const style = {
  overlay:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    background: '#000000',
    opacity: 0.6
  },
  row: {
    height: "80vh"
  },
  leftRow: {
    maxWidth: "1000px",
    margin: " 0 auto"
  },
  listItem: {
    height: "100%",
    overflowY: "auto"
  },
  searchIcon: {
    cursor: "pointer",
    margin: "4px"
  },
  searchBtn: {
    margin: "5px"
  },
  searchCol: {
    margin: "10px 0",
    fontFamily: "sans-serif"
  },
  label: {
    fontSize: "larger",
    color: "white"
  },
  courseHeader: {
    margin: "10px 0",
    fontFamily: "sans-serif",
    fontSize: "larger",
    color: "white"
  }
};

export default Home;
