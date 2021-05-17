
function travel(pos_json){
    /*
    1. Update the relative position given the new camera position
    2. Find the corresponding 2d position on screen
    3. Alter the radius
     */
    pos_json.relative_pos = get_relative_to_camera(pos_json.relative_pos)
    dim_shift(pos_json)
    radius_alter(pos_json)
}

function dim_shift(pos_json,
                   type='to_3d',
                   x_3d_coord = pos_json.relative_pos.x,
                   initialize=false){
    /*
    to_3d(to get pos_json.relative_pos): goes from 2d screen coords to universe coords taking into
        account the window params: finds the unit vector of the 3d vector
        relative to the observer. Finds the scaling factor 'k' such that
        when this unit vector is multiplied by this, it will reach the point
        of the desired x value. The new y,z positions are the old ones scaled
        by this factor and z is the desired z.
    from_3d(to get pos_json.screen_pos): reverse logic.
    x_random: value of x wrt the window, useful only from 2d to 3d conversion
     */
    if (type==='to_3d'){
        observer_rel_2d = createVector(window_params.offset, pos_json.screen_pos.y, pos_json.screen_pos.z)
        scale_factor = (x_3d_coord+window_params.offset)/observer_rel_2d.normalize().x
        full_vec = createVector(
            x_3d_coord,
            scale_factor*pos_json.screen_pos.y,
            scale_factor*pos_json.screen_pos.z)
        pos_json.relative_pos = full_vec
        if (initialize){
            pos_json.fixed_pos = full_vec
        }
    } else if (type==='from_3d'){
        observer_rel_3d = createVector(
            pos_json.relative_pos.x + window_params.offset,
            pos_json.relative_pos.y,
            pos_json.relative_pos.z)
        scale_factor = window_params.offset/observer_rel_3d.normalize().x
        pos_json.screen_pos = createVector(
            0,
            scale_factor*pos_json.screen_pos.y,
            scale_factor*pos_json.screen_pos.z)
    }
}

function get_relative_to_camera(pos_vec){
    /*
    This func finds the relative position vector of star wrt current camera_polar
     */
    return pos_vec.sub(p5.Vector.fromAngles(camera_polar.x,camera_polar.y,camera_polar.z))
}

function radius_alter(pos_json){
    /*
    Using similar triangles, finds the radius value at the current
    position wrt the original spawn position
     */
    pos_json.screen_rad = (pos_json.fixed_pos.mag()*pos_json.fixed_rad)/pos_json.relative_pos.mag();
}

function spawn_by_shape(){
    /*
    Returns a random location (2d) of type p5.Vector of the
    new star based on the how the spaceship window looks!
     */
    let circ_calc = function(){return math.sqrt(math.square(h/w)*(math.square(w)-math.square(x_val-x)))}
    let [x_abs,x,y,w,h] = [math.randomInt(width),...center,window_params.w, window_params.h]
    if ((x-w/2)<=x_abs && x_abs<=(x+w/2)) {
        if (space_ship_shape === 'ellipse') {
            y_lim = circ_calc()
        } else if (space_ship_shape === 'circle') {
            h = w
            y_lim = circ_calc()
        } else if (space_ship_shape === 'rect') {
            y_lim = h/2
        }
        y_abs = [math.randomInt(y - y_lim), math.randomInt(y + y_lim, height)][math.randomInt(2)]
    } else {
        y_abs = math.randomInt(height)
    }
    let [y_rel, z_rel] = [x_abs-center[0], y_abs-center[1]]
    // TODO: extend vector till the x offset plane to get new y,z values.
    return [x_val, y_val]
}