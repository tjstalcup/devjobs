$(document).ready(function(){


  if($('.hasSkill').length){
    let numOfSkills = $('.job-skills li').length;
    let userSkills = $('.job-skills li.hasSkill').length;
    let match = (userSkills / numOfSkills) * 100;
    let className='match-0';
    if(match==100){
      className = 'match-100';
    } else if (match>=80){
      className = 'match-80';
    } else if (match>=60){
      className = 'match-60';
    } else if (match>=40){
      className = 'match-40';
    }
    $('.percent-match').text(`${match}% match`).addClass(className);
  }

});