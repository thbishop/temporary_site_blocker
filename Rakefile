require 'rubygems'
require 'rake'
require 'tmpdir'
require 'open3'

desc "Preps the working dir for packaging.  Copies this dir to a temp location, removes unneeded files, and moves the result to your home dir."
task :package do
  TO_REMOVE = [ '.git', 'Rakefile', '.gitignore' ]
  tmp_dir = '/var/tmp/temporary_site_blocker'
  zip_pkg = '/var/tmp/temporary_site_blocker.zip'

  FileUtils.rm_r tmp_dir if File.exists? tmp_dir
  FileUtils.rm_r zip_pkg if File.exists? zip_pkg
  print "Copying #{FileUtils.pwd} to #{tmp_dir}..."
  FileUtils.cp_r FileUtils.pwd, tmp_dir
  puts "done"
  TO_REMOVE.each { |item| print "Removing #{File.join(tmp_dir, item) }..."; FileUtils.rm_r File.join(tmp_dir, item); puts 'done' }
  print "Creating zip #{zip_pkg}...."
  `zip -9 #{zip_pkg} #{tmp_dir}`
  if $?.exitstatus == 0
    puts 'done'
  else
    puts "zipping failed with exit status #{$?.exitstatus}"
  end
end
