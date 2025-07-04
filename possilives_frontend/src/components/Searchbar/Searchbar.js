import classes from "./Searchbar.module.css";
import { Button, Input } from "reactstrap";

const Searchbar = ({ onChange, value, onSubmit, placeholder }) => {
  return (
    <div className={classes.searchBlock}>
      <Input
        className={classes.searchbar}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
      <Button onClick={onSubmit} className={classes.searchButton}>
        <i class="fa fa-search"></i>
      </Button>
    </div>
  );
};

export default Searchbar;
